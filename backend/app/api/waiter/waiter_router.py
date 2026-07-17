from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
import math

from app.db.database import get_db
from app.api.deps import get_current_waiter
from app.models.security import Employee
from app.models.restaurant import RestaurantTable, TableAssignment
from app.models.ordering import CustomerSession, Order, OrderItem
from app.models.menu import MenuCategory, MenuItem
from app.schemas.waiter import WaiterTableResponse, WaiterMenuCategory, WaiterStartSessionRequest
from app.schemas.ordering import OrderCreate
from app.websocket.connection_manager import manager

router = APIRouter(prefix="/waiter", tags=["Waiter Portal"])

@router.get("/me")
async def get_me(current_user: Employee = Depends(get_current_waiter)):
    return {"message": "Welcome Waiter", "employee_code": current_user.employee_code, "name": current_user.full_name}

@router.get("/tables", response_model=List[WaiterTableResponse])
async def get_tables(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(RestaurantTable).join(TableAssignment).where(
        TableAssignment.employee_id == current_user.id,
        TableAssignment.is_active == True
    ).options(
        selectinload(RestaurantTable.sessions).selectinload(CustomerSession.orders).selectinload(Order.items),
        selectinload(RestaurantTable.sessions).selectinload(CustomerSession.bills)
    )
    result = await db.execute(query)
    tables = result.scalars().all()

    waiter_tables = []
    for table in tables:
        active_session = next((s for s in table.sessions if s.status == "Active"), None)
        
        display_status = "Empty"
        time_str = ""
        guests = 0
        order_str = ""
        current_bill = 0.0
        
        if active_session:
            display_status = "Occupied"
            guests = active_session.number_of_people or 0
            
            delta = datetime.utcnow() - active_session.created_at
            minutes = int(delta.total_seconds() / 60)
            if minutes > 60:
                hours = minutes // 60
                mins = minutes % 60
                time_str = f"{hours}h {mins}m"
            else:
                time_str = f"{minutes}m"
                
            active_orders = [o for o in active_session.orders if o.status not in ("Completed", "Cancelled")]
            if active_orders:
                order_str = f"#{active_orders[0].id}"
                if any(o.status == "Cooked" for o in active_orders):
                    display_status = "Ready to Serve"
            
            # Check bills
            pending_bills = [b for b in active_session.bills if b.payment_status == "Pending"]
            if pending_bills:
                display_status = "Payment Pending"
                current_bill = float(sum(b.grand_total for b in pending_bills))
            else:
                for o in active_session.orders:
                    if o.status not in ("Cancelled",):
                        for item in o.items:
                            current_bill += float(item.price_at_order) * item.quantity

        waiter_tables.append(WaiterTableResponse(
            id=table.table_number,
            table_number=table.table_number,
            capacity=table.capacity,
            status=display_status,
            time=time_str,
            guests=guests,
            order=order_str,
            currentBill=current_bill
        ))
        
    return waiter_tables

@router.get("/menu", response_model=List[WaiterMenuCategory])
async def get_menu(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(MenuCategory).where(MenuCategory.is_active == True).options(
        selectinload(MenuCategory.items)
    )
    result = await db.execute(query)
    categories = result.scalars().all()
    
    res = []
    for cat in categories:
        active_items = [i for i in cat.items if i.is_active]
        if active_items:
            res.append(WaiterMenuCategory(
                id=cat.id,
                name=cat.name,
                items=active_items
            ))
    return res

@router.post("/tables/{table_id}/sessions")
async def start_session(
    table_id: str,
    req: WaiterStartSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(RestaurantTable).where(RestaurantTable.table_number == table_id)
    result = await db.execute(query)
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    # Check for existing active session
    active_session_query = select(CustomerSession).where(
        CustomerSession.table_id == table.id,
        CustomerSession.status == "Active"
    )
    active_session_result = await db.execute(active_session_query)
    existing_session = active_session_result.scalars().first()
    
    if existing_session:
        raise HTTPException(status_code=400, detail="An active session already exists for this table.")
        
    session = CustomerSession(
        table_id=table.id,
        number_of_people=req.guests,
        status="Active"
    )
    db.add(session)
    table.status = "Occupied"
    
    await db.commit()
    await db.refresh(session)
    return {"message": "Session started", "session_id": session.id}

@router.post("/sessions/{session_id}/orders")
async def create_order(
    session_id: int,
    req: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(CustomerSession).where(CustomerSession.id == session_id).options(
        selectinload(CustomerSession.table),
        selectinload(CustomerSession.bills)
    )
    result = await db.execute(query)
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status != "Active":
        raise HTTPException(status_code=400, detail="Cannot create order for inactive session")
        
    # Check if a bill has already been generated
    active_bills = [b for b in session.bills if b.payment_status not in ("Refunded", "Failed")]
    if active_bills:
        raise HTTPException(status_code=400, detail="Cannot add items after the bill has been generated.")
        
    order = Order(
        session_id=session.id,
        waiter_id=current_user.id,
        order_type="Dine-in",
        status="Pending",
        special_instructions=req.special_instructions
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
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
        
    await db.commit()
    
    # Broadcast to operator and kitchen
    await manager.broadcast("NEW_ORDER", {
        "order_id": order.id,
        "table_id": session.table.table_number,
        "status": order.status
    }, ["operator", "kitchen"])
    
    return {"message": "Order created", "order_id": order.id}

@router.get("/tables/{table_id}/active_session")
async def get_active_session(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(RestaurantTable).where(RestaurantTable.table_number == table_id)
    result = await db.execute(query)
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    s_query = select(CustomerSession).where(
        CustomerSession.table_id == table.id, 
        CustomerSession.status == "Active"
    ).options(
        selectinload(CustomerSession.orders).selectinload(Order.items).selectinload(OrderItem.menu_item)
    )
    s_result = await db.execute(s_query)
    session = s_result.scalars().first()
    
    if not session:
        return {"session_id": None}
        
    formatted_orders = []
    for order in session.orders:
        items = []
        total = 0
        for i in order.items:
            items.append({
                "id": i.id,
                "menu_item_id": i.menu_item_id,
                "name": i.menu_item.name if i.menu_item else "Unknown",
                "quantity": i.quantity,
                "price": float(i.price_at_order),
                "notes": i.notes
            })
            total += float(i.price_at_order) * i.quantity
            
        formatted_orders.append({
            "id": order.id,
            "status": order.status,
            "items": items,
            "total": total,
            "time": order.created_at.isoformat()
        })
        
    return {
        "session_id": session.id,
        "guests": session.number_of_people,
        "orders": formatted_orders
    }
