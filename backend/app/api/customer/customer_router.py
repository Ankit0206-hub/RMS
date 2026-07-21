from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

from app.db.database import get_db
from app.api.deps import get_current_customer_session
from app.models.restaurant import RestaurantTable, TableAssignment
from app.models.ordering import CustomerSession, Order, OrderItem
from app.models.billing import Bill
from app.models.menu import MenuCategory, MenuItem
from app.api.websocket_router import manager

router = APIRouter()

class CustomerStartSessionRequest(BaseModel):
    table_id: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    guests: int

class CustomerOrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int
    notes: Optional[str] = None

class CustomerOrderCreate(BaseModel):
    special_instructions: Optional[str] = None
    items: List[CustomerOrderItemRequest]

@router.get("/tables")
async def get_vacant_tables(db: AsyncSession = Depends(get_db)):
    # Return tables that do NOT have an active session
    query = select(RestaurantTable).options(selectinload(RestaurantTable.sessions))
    result = await db.execute(query)
    tables = result.scalars().all()
    
    vacant_tables = []
    for table in tables:
        active_session = next((s for s in table.sessions if s.status == "Active"), None)
        if not active_session:
            vacant_tables.append({
                "id": table.table_number,
                "capacity": table.capacity
            })
            
    return vacant_tables

@router.post("/sessions")
async def start_customer_session(
    req: CustomerStartSessionRequest,
    db: AsyncSession = Depends(get_db)
):
    query = select(RestaurantTable).where(RestaurantTable.table_number == req.table_id)
    result = await db.execute(query)
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    # Check for existing active session with a lock
    active_session_query = select(CustomerSession).where(
        CustomerSession.table_id == table.id,
        CustomerSession.status == "Active"
    ).with_for_update()
    active_session_result = await db.execute(active_session_query)
    existing_session = active_session_result.scalars().first()
    
    if existing_session:
        from app.core.security import create_access_token
        token = create_access_token(subject=str(existing_session.id), role="customer")
        return {"message": "Joined existing session", "session_id": existing_session.id, "token": token}
        
    session = CustomerSession(
        table_id=table.id,
        customer_name=req.customer_name,
        customer_phone=req.customer_phone,
        number_of_people=req.guests,
        status="Active"
    )
    db.add(session)
    table.status = "Occupied"
    
    await db.commit()
    await db.refresh(session)
    
    # Broadcast to waiters/operators that a table was occupied
    await manager.broadcast("TABLE_UPDATED", {
        "table_id": table.table_number,
        "status": "Occupied"
    }, ["operator", "waiter"])
    
    from app.core.security import create_access_token
    token = create_access_token(subject=str(session.id), role="customer")
    
    return {"message": "Session started", "session_id": session.id, "token": token}

@router.get("/menu")
async def get_customer_menu(db: AsyncSession = Depends(get_db)):
    query = select(MenuCategory).where(MenuCategory.is_active == True).options(
        selectinload(MenuCategory.items).selectinload(MenuItem.images)
    )
    result = await db.execute(query)
    categories = result.scalars().all()
    
    res = []
    for cat in categories:
        active_items = [i for i in cat.items if i.is_active]
        if active_items:
            res.append({
                "id": cat.id,
                "name": cat.name,
                "items": [
                    {
                        "id": item.id,
                        "name": item.name,
                        "description": item.description,
                        "price": float(item.price),
                        "image_url": item.images[0].image_url if getattr(item, 'images', None) and len(item.images) > 0 else "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
                        "is_veg": item.is_veg,
                        "half_price": float(item.half_price) if item.half_price is not None else None
                    }
                    for item in active_items
                ]
            })
    return res

@router.post("/sessions/{session_id}/orders")
async def create_customer_order(
    session_id: int,
    req: CustomerOrderCreate,
    db: AsyncSession = Depends(get_db),
    session: CustomerSession = Depends(get_current_customer_session)
):
    if session.id != session_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this session")
        
    if session.status != "Active":
        raise HTTPException(status_code=400, detail="Cannot create order for inactive session")
        
    # Find an active order for this session
    query = select(Order).where(
        Order.session_id == session.id,
        Order.status.in_(["Verification Pending", "Pending", "Preparing"])
    ).order_by(Order.created_at.desc())
    result = await db.execute(query)
    existing_order = result.scalars().first()
    
    is_new_order = False
    if existing_order:
        order = existing_order
    else:
        order = Order(
            session_id=session.id,
            waiter_id=None,
            order_type="Dine-in",
            status="Verification Pending",
            special_instructions=req.special_instructions
        )
        db.add(order)
        await db.flush()
        is_new_order = True
    
    for item_req in req.items:
        mi_query = select(MenuItem).where(MenuItem.id == item_req.menu_item_id)
        mi_result = await db.execute(mi_query)
        menu_item = mi_result.scalars().first()
        if not menu_item:
            continue
            
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=item_req.quantity,
            price_at_order=menu_item.price,
            notes=item_req.notes
        )
        db.add(order_item)
        
    # If the user appended items but it was already pending, maybe append their special instructions
    if not is_new_order and req.special_instructions:
        if order.special_instructions:
            order.special_instructions += f" | {req.special_instructions}"
        else:
            order.special_instructions = req.special_instructions

    await db.commit()
    await db.refresh(order)
    
    # Broadcast to operator and waiter channels
    if is_new_order:
        await manager.broadcast("order.created", {
            "order_id": order.id,
            "table_id": session.table.table_number,
            "status": order.status
        }, ["operator", "waiter", "kitchen"])
    else:
        await manager.broadcast("order.updated", {
            "order_id": order.id,
            "table_id": session.table.table_number,
            "status": order.status
        }, ["operator", "waiter", "kitchen"])
    
    return {"message": "Order placed successfully", "order_id": order.id}

@router.get("/sessions/{session_id}")
async def get_customer_session_details(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    session_token_data: CustomerSession = Depends(get_current_customer_session)
):
    if session_token_data.id != session_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
        
    query = select(CustomerSession).where(CustomerSession.id == session_id).options(
        selectinload(CustomerSession.orders).selectinload(Order.items).selectinload(OrderItem.menu_item).selectinload(MenuItem.images),
        selectinload(CustomerSession.bills)
    )
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    formatted_orders = []
    subtotal = 0.0
    for order in session.orders:
        items = []
        for i in order.items:
            items.append({
                "id": i.id,
                "name": i.menu_item.name if i.menu_item else "Unknown",
                "image": i.menu_item.images[0].image_url if getattr(i.menu_item, 'images', None) and len(i.menu_item.images) > 0 else getattr(i.menu_item, 'image_url', "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop") if i.menu_item else "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
                "quantity": i.quantity,
                "price": float(i.price_at_order),
                "notes": i.notes
            })
            if order.status not in ("Cancelled",):
                subtotal += float(i.price_at_order) * i.quantity
                
        formatted_orders.append({
            "id": order.id,
            "status": order.status,
            "items": items,
            "time": order.created_at.isoformat()
        })
        
    tax_rate = 0.05
    tax_amount = subtotal * tax_rate
    grand_total = subtotal + tax_amount
    
    active_bills = [b for b in session.bills if b.payment_status not in ("Refunded", "Failed")]
    bill_status = active_bills[0].payment_status if active_bills else None
    bill_id = active_bills[0].id if active_bills else None

    return {
        "session_id": session.id,
        "table_id": session.table_id,
        "customer_name": session.customer_name,
        "status": session.status,
        "orders": formatted_orders,
        "subtotal": subtotal,
        "tax": tax_amount,
        "grand_total": grand_total,
        "bill_status": bill_status,
        "bill_id": bill_id
    }

@router.post("/sessions/{session_id}/request-bill")
async def request_customer_bill(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    session_token_data: CustomerSession = Depends(get_current_customer_session)
):
    if session_token_data.id != session_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
        
    query = select(CustomerSession).where(CustomerSession.id == session_id).options(
        selectinload(CustomerSession.table),
        selectinload(CustomerSession.bills)
    )
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.bill_requested = True
    await db.commit()
        
    # Broadcast to operator and waiter channels
    await manager.broadcast("CUSTOMER_REQUESTED_BILL", {
        "session_id": session.id,
        "table_id": session.table.table_number
    }, ["operator", "waiter"])
    
    return {"message": "Bill requested"}

class CallWaiterRequest(BaseModel):
    request_type: str # 'water', 'tissue', 'waiter'

@router.post("/sessions/{session_id}/call-waiter")
async def call_waiter(
    session_id: int,
    req: CallWaiterRequest,
    db: AsyncSession = Depends(get_db),
    session_token_data: CustomerSession = Depends(get_current_customer_session)
):
    if session_token_data.id != session_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
        
    query = select(CustomerSession).where(CustomerSession.id == session_id).options(
        selectinload(CustomerSession.table)
    )
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    await manager.broadcast("CUSTOMER_NEEDS_ASSISTANCE", {
        "session_id": session.id,
        "table_id": session.table.table_number,
        "request_type": req.request_type
    }, ["waiter"])
    
    return {"message": f"Requested {req.request_type}"}
