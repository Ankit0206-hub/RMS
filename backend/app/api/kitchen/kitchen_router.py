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

async def check_and_update_order_status(db: AsyncSession, order_id: int):
    query = select(OrderItem).filter(OrderItem.order_id == order_id)
    result = await db.execute(query)
    all_items = result.scalars().all()
    
    if not all_items:
        return
        
    order_query = select(Order).filter(Order.id == order_id)
    order_result = await db.execute(order_query)
    order = order_result.scalar_one_or_none()
    
    if not order:
        return
        
    from app.services.ordering_service import OrderingService
    from app.schemas.ordering import OrderStatusUpdate
    service = OrderingService()
    
    if all(item.status in ["prepared", "served"] for item in all_items):
        if order.status != "Cooked":
            try:
                await service.update_order_status(db, order_id, OrderStatusUpdate(status="Cooked"))
            except Exception as e:
                print(f"Failed to automatically update order status to Cooked: {e}")
    else:
        if order.status in ["Confirmed", "Pending", "Placed", "Cooked", "Served"]:
            try:
                await service.update_order_status(db, order_id, OrderStatusUpdate(status="Preparing"))
            except Exception as e:
                print(f"Failed to automatically update order status to Preparing: {e}")

@router.get("/stats", response_model=Dict[str, Any])
async def get_kitchen_stats(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_kitchen)
):
    """
    Get dashboard statistics for the current kitchen user's assigned kitchen.
    """
    kitchen_id = current_user.kitchen_id

    from sqlalchemy import func

    # Count items by status for this kitchen
    query = (
        select(OrderItem.status, func.count(OrderItem.id))
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
    )
    if kitchen_id:
        query = query.filter(MenuItem.kitchen_id == kitchen_id)
    
    query = query.group_by(OrderItem.status)
    result = await db.execute(query)
    status_counts = dict(result.all())

    # Count unique active orders for this kitchen
    active_orders_query = (
        select(func.count(func.distinct(OrderItem.order_id)))
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.status.notin_(["Completed", "Cancelled", "Served"]))
    )
    if kitchen_id:
        from sqlalchemy import or_
        active_orders_query = active_orders_query.filter(or_(MenuItem.kitchen_id == kitchen_id, MenuItem.kitchen_id.is_(None)))
    active_orders_result = await db.execute(active_orders_query)
    total_active_orders = active_orders_result.scalar() or 0

    return {
        "totalOrders": total_active_orders,
        "preparing": status_counts.get("preparing", 0),
        "ready": status_counts.get("prepared", 0),
        "completed": status_counts.get("served", 0)
    }

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
            OrderItem.status.in_(["received", "preparing"]),
            Order.status.notin_(["Completed", "Cancelled"])
        )
    )
    
    if kitchen_id:
        from sqlalchemy import or_
        query = query.filter(or_(MenuItem.kitchen_id == kitchen_id, MenuItem.kitchen_id.is_(None)))
        
    query = query.order_by(OrderItem.created_at.asc())
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

    query = (
        select(OrderItem)
        .options(
            joinedload(OrderItem.order),
            joinedload(OrderItem.menu_item)
        )
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            OrderItem.status.in_(["prepared", "served"]),
            Order.status.notin_(["Completed", "Cancelled"])
        )
    )
    
    if kitchen_id:
        from sqlalchemy import or_
        query = query.filter(or_(MenuItem.kitchen_id == kitchen_id, MenuItem.kitchen_id.is_(None)))
        
    query = query.order_by(OrderItem.updated_at.desc())
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
    
    order_id = item.order_id
    updated_status = item.status
    
    await db.commit()

    # Emit websocket notification for the waiter
    from app.websocket.connection_manager import manager
    await manager.broadcast(
        event="ORDER_ITEM_UPDATED",
        payload={
            "item_id": item_id,
            "order_id": order_id,
            "status": updated_status
        },
        target_roles=["waiter", "kitchen", "display"]
    )
    
    # Notify customer about order update
    order_query = select(Order).filter(Order.id == order_id)
    order_result = await db.execute(order_query)
    order = order_result.scalar_one_or_none()
    if order and order.session_id:
        await manager.notify_customer(
            session_id=order.session_id,
            event="order.updated",
            payload={
                "order_id": order_id,
                "status": updated_status
            }
        )

    await check_and_update_order_status(db, order_id)

    return {"message": "Status updated successfully", "status": updated_status}

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

    query = (
        select(OrderItem)
        .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
        .filter(
            OrderItem.order_id == order_id
        )
    )
    
    if kitchen_id:
        from sqlalchemy import or_
        query = query.filter(or_(MenuItem.kitchen_id == kitchen_id, MenuItem.kitchen_id.is_(None)))
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
            target_roles=["waiter", "kitchen", "display"]
        )
        
    order_query = select(Order).filter(Order.id == order_id)
    order_result = await db.execute(order_query)
    order = order_result.scalar_one_or_none()
    if order and order.session_id:
        # Notify customer about order update
        await manager.notify_customer(
            session_id=order.session_id,
            event="order.updated",
            payload={
                "order_id": order_id,
                "status": status_update.status
            }
        )

    await check_and_update_order_status(db, order_id)

    return {"message": "Order items updated successfully", "updated_count": len(updated_ids), "status": status_update.status}
