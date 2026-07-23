from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload
from typing import Any, Dict, List
from pydantic import BaseModel
from datetime import datetime

from app.db.database import get_db
from app.models.ordering import Order, OrderItem
from app.models.menu import MenuItem
from app.models.security import Employee
from app.api.deps import get_current_kitchen

router = APIRouter()

class OrderItemStatusUpdate(BaseModel):
    status: str

@router.get("/orders", response_model=Dict[str, Any])
async def get_kitchen_orders(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_kitchen)
):
    """
    Get active orders (received, preparing) for the current kitchen user's assigned kitchen.
    Returns items grouped by order.
    """
    kitchen_id = current_user.kitchen_id
    if not kitchen_id:
        return {"data": []}

    # Fetch order items for this kitchen that are not prepared
    query = (
        select(OrderItem)
        .options(
            joinedload(OrderItem.order),
            joinedload(OrderItem.menu_item)
        )
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            MenuItem.kitchen_id == kitchen_id,
            OrderItem.status.in_(["received", "preparing"]),
            Order.status.notin_(["Completed", "Cancelled", "Served"])
        )
        .order_by(OrderItem.created_at.asc())
    )
    result = await db.execute(query)
    items = result.scalars().all()

    # Group by order
    orders_map = {}
    for item in items:
        order = item.order
        if order.id not in orders_map:
            orders_map[order.id] = {
                "id": order.id,
                "created_at": order.created_at.isoformat(),
                "order_type": order.order_type,
                "special_instructions": order.special_instructions,
                "items": []
            }
        
        orders_map[order.id]["items"].append({
            "id": item.id,
            "menu_item_name": item.menu_item.name,
            "quantity": item.quantity,
            "notes": item.notes,
            "status": item.status,
            "created_at": item.created_at.isoformat()
        })

    # Sort orders by the oldest item they contain
    grouped_orders = list(orders_map.values())
    grouped_orders.sort(key=lambda o: min([i["created_at"] for i in o["items"]]))

    return {"data": grouped_orders}

@router.get("/prepared", response_model=Dict[str, Any])
async def get_kitchen_prepared_items(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_kitchen)
):
    """
    Get prepared orders for the current kitchen user's assigned kitchen.
    """
    kitchen_id = current_user.kitchen_id
    if not kitchen_id:
        return {"data": []}

    query = (
        select(OrderItem)
        .options(
            joinedload(OrderItem.order),
            joinedload(OrderItem.menu_item)
        )
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            MenuItem.kitchen_id == kitchen_id,
            OrderItem.status == "prepared",
            Order.status.notin_(["Completed", "Cancelled", "Served"])
        )
        .order_by(OrderItem.updated_at.desc())
    )
    result = await db.execute(query)
    items = result.scalars().all()

    orders_map = {}
    for item in items:
        order = item.order
        if order.id not in orders_map:
            orders_map[order.id] = {
                "id": order.id,
                "created_at": order.created_at.isoformat(),
                "order_type": order.order_type,
                "items": []
            }
        
        orders_map[order.id]["items"].append({
            "id": item.id,
            "menu_item_name": item.menu_item.name,
            "quantity": item.quantity,
            "notes": item.notes,
            "status": item.status,
            "updated_at": item.updated_at.isoformat()
        })

    grouped_orders = list(orders_map.values())
    return {"data": grouped_orders}

@router.patch("/items/{item_id}/status", response_model=Dict[str, Any])
async def update_item_status(
    item_id: int,
    status_update: OrderItemStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_kitchen)
):
    valid_statuses = ["received", "preparing", "prepared", "served"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    query = select(OrderItem).filter(OrderItem.id == item_id)
    result = await db.execute(query)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    item.status = status_update.status
    item.updated_at = datetime.utcnow()
    
    await db.commit()

    # Emit websocket notification for the waiter
    from app.websocket.connection_manager import manager
    await manager.broadcast(
        event="ORDER_ITEM_UPDATED",
        payload={
            "item_id": item.id,
            "order_id": item.order_id,
            "status": item.status
        },
        target_roles=["waiter"]
    )

    return {"message": "Status updated successfully", "status": item.status}

@router.patch("/orders/{order_id}/status", response_model=Dict[str, Any])
async def update_order_items_status(
    order_id: int,
    status_update: OrderItemStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_kitchen)
):
    valid_statuses = ["received", "preparing", "prepared", "served"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    kitchen_id = current_user.kitchen_id
    if not kitchen_id:
        raise HTTPException(status_code=400, detail="No kitchen assigned")

    query = (
        select(OrderItem)
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .filter(
            OrderItem.order_id == order_id,
            MenuItem.kitchen_id == kitchen_id
        )
    )
    result = await db.execute(query)
    items = result.scalars().all()

    if not items:
        raise HTTPException(status_code=404, detail="No items found for this order in your kitchen")

    updated_ids = []
    for item in items:
        # Only update if the status is not already served
        if item.status != 'served':
            item.status = status_update.status
            item.updated_at = datetime.utcnow()
            updated_ids.append(item.id)
    
    await db.commit()

    # Emit websocket notification for each updated item
    from app.websocket.connection_manager import manager
    for i_id in updated_ids:
        await manager.broadcast(
            event="ORDER_ITEM_UPDATED",
            payload={
                "item_id": i_id,
                "order_id": order_id,
                "status": status_update.status
            },
            target_roles=["waiter"]
        )

    return {"message": "Order items updated successfully", "updated_count": len(updated_ids), "status": status_update.status}

