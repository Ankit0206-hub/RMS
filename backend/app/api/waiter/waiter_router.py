from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
import os
import shutil
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from pydantic import BaseModel
import math

from app.db.database import get_db
from app.api.deps import get_current_waiter
from app.models.security import Employee
from app.models.restaurant import RestaurantTable, TableAssignment
from app.models.ordering import CustomerSession, Order, OrderItem
from app.models.menu import MenuCategory, MenuItem, VariantGroup, VariantItem, AddonGroup, AddonItem
from app.schemas.waiter import WaiterTableResponse, WaiterMenuCategory, WaiterStartSessionRequest
from app.schemas.ordering import OrderCreate
from app.websocket.connection_manager import manager
from app.utils.storage import upload_file_to_r2_or_local, delete_file_r2_or_local

router = APIRouter(prefix="/waiter", tags=["Waiter Portal"])

@router.get("/me")
async def get_me(current_user: Employee = Depends(get_current_waiter)):
    return {
        "id": current_user.id,
        "employee_code": current_user.employee_code,
        "name": current_user.full_name,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "email": current_user.email,
        "image_url": current_user.image_url
    }

class WaiterUpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str

@router.put("/me")
async def update_me(
    req: WaiterUpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    current_user.first_name = req.first_name
    current_user.last_name = req.last_name
    current_user.phone = req.phone
    current_user.email = req.email
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Profile updated successfully"}

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image")
        
    # Upload to R2 or Local
    new_image_url = await upload_file_to_r2_or_local(file, directory="profiles")
        
    # Delete old image if it exists
    if current_user.image_url:
        delete_file_r2_or_local(current_user.image_url)
            
    # Save URL
    current_user.image_url = new_image_url
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Avatar uploaded successfully", "image_url": current_user.image_url}

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
            
            if minutes < 0:
                minutes = 0
                
            if minutes >= 1440:
                days = minutes // 1440
                hours = (minutes % 1440) // 60
                time_str = f"{days}d {hours}h"
            elif minutes >= 60:
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
            elif active_session.bill_requested:
                display_status = "Bill Requested"
                for o in active_session.orders:
                    if o.status not in ("Cancelled",):
                        for item in o.items:
                            current_bill += float(item.price_at_order) * item.quantity
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
        selectinload(MenuCategory.items).selectinload(MenuItem.images),
        selectinload(MenuCategory.items).selectinload(MenuItem.variant_groups).selectinload(VariantGroup.variants),
        selectinload(MenuCategory.items).selectinload(MenuItem.addon_groups).selectinload(AddonGroup.addons)
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
                is_spicy_customizable=cat.is_spicy_customizable,
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
        
    # Check for existing active session with lock
    active_session_query = select(CustomerSession).where(
        CustomerSession.table_id == table.id,
        CustomerSession.status == "Active"
    ).with_for_update()
    active_session_result = await db.execute(active_session_query)
    existing_session = active_session_result.scalars().first()
    
    if existing_session:
        raise HTTPException(status_code=400, detail="An active session already exists for this table.")
        
    import random
    new_pin = f"{random.randint(1000, 9999)}"
    
    session = CustomerSession(
        table_id=table.id,
        number_of_people=req.guests,
        status="Active",
        session_pin=new_pin
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
        status="Preparing",
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
        "orders": formatted_orders,
        "bill_requested": session.bill_requested
    }

@router.post("/sessions/{session_id}/request-bill")
async def request_waiter_bill(
    session_id: int,
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
        
    session.bill_requested = True
    await db.commit()
        
    # Broadcast to operator and waiter channels
    await manager.broadcast("WAITER_REQUESTED_BILL", {
        "session_id": session.id,
        "table_id": session.table.table_number
    }, ["operator", "waiter"])
    
    return {"message": "Bill requested"}

class WaiterTransferSessionRequest(BaseModel):
    target_table_id: str

@router.put("/sessions/{session_id}/transfer")
async def transfer_session(
    session_id: int,
    req: WaiterTransferSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    # Lock the target table to check if it's available
    target_table_query = select(RestaurantTable).where(
        RestaurantTable.table_number == req.target_table_id
    ).with_for_update()
    target_table_result = await db.execute(target_table_query)
    target_table = target_table_result.scalars().first()

    if not target_table:
        raise HTTPException(status_code=404, detail="Target table not found")

    if target_table.status != "Available":
        raise HTTPException(status_code=400, detail="Target table is not available")

    # Get the session and lock the old table
    session_query = select(CustomerSession).where(
        CustomerSession.id == session_id
    ).options(selectinload(CustomerSession.table)).with_for_update()
    session_result = await db.execute(session_query)
    session = session_result.scalars().first()

    if not session or session.status != "Active":
        raise HTTPException(status_code=404, detail="Active session not found")
    old_table = session.table
    old_table_number = old_table.table_number

    # Transfer the session
    session.table_id = target_table.id
    old_table.status = "Available"
    target_table.status = "Occupied"

    # Transfer active waiter assignment
    from sqlalchemy import update
    await db.execute(
        update(TableAssignment)
        .where(TableAssignment.table_id == old_table.id, TableAssignment.is_active == True)
        .values(table_id=target_table.id)
    )

    await db.commit()

    # Broadcast changes to both tables
    await manager.broadcast("TABLE_UPDATED", {
        "table_id": old_table_number,
        "status": "Available"
    }, ["operator", "waiter"])
    
    await manager.broadcast("TABLE_UPDATED", {
        "table_id": target_table.table_number,
        "status": "Occupied"
    }, ["operator", "waiter"])

    return {"message": "Table transferred successfully"}



from app.models.ordering import AssistanceRequest

@router.get("/requests")
async def get_requests(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(AssistanceRequest).options(selectinload(AssistanceRequest.session).selectinload(CustomerSession.table)).order_by(AssistanceRequest.created_at.desc())
    result = await db.execute(query)
    requests = result.scalars().all()
    
    formatted = []
    for r in requests:
        table_num = r.session.table.table_number if r.session and r.session.table else "Unknown"
        delta = datetime.now() - r.created_at
        minutes = int(delta.total_seconds() / 60)
        time_str = "Just Now" if minutes == 0 else f"{minutes} mins ago" if minutes < 60 else f"{minutes // 60}h ago"
        
        formatted.append({
            "id": r.id,
            "type": r.request_type,
            "table": table_num,
            "time": time_str,
            "message": r.message,
            "status": r.status
        })
    return formatted

@router.put("/requests/{request_id}/resolve")
async def resolve_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(AssistanceRequest).where(AssistanceRequest.id == request_id)
    result = await db.execute(query)
    req = result.scalars().first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    req.status = "Resolved"
    req.resolved_by_employee_id = current_user.id
    req.resolved_at = datetime.now()
    await db.commit()
    return {"message": "Request resolved"}

from app.models.system import Notification

@router.get("/notifications")
async def get_waiter_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(Notification).where(
        Notification.employee_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50)
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return [{
        "id": n.id,
        "type": n.notification_type,
        "title": n.title,
        "message": n.message,
        "is_read": n.is_read,
        "time": n.created_at.isoformat()
    } for n in notifications]

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    query = select(Notification).where(
        Notification.id == notification_id,
        Notification.employee_id == current_user.id
    )
    result = await db.execute(query)
    notif = result.scalars().first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    await db.commit()
    return {"message": "Notification marked as read"}

@router.post("/tables/{table_id}/clear")
async def clear_waiter_table(
    table_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Employee = Depends(get_current_waiter)
):
    from sqlalchemy.future import select
    from fastapi import HTTPException
    from app.models.restaurant import RestaurantTable, TableAssignment
    from sqlalchemy.orm import selectinload
    
    assignment_query = select(TableAssignment).join(RestaurantTable).where(
        RestaurantTable.table_number == table_id,
        TableAssignment.employee_id == current_user.id,
        TableAssignment.is_active == True
    )
    assignment_result = await db.execute(assignment_query)
    if not assignment_result.scalars().first():
        raise HTTPException(status_code=403, detail="Not assigned to this table")

    query = select(RestaurantTable).where(RestaurantTable.table_number == table_id).options(
        selectinload(RestaurantTable.sessions)
    )
    result = await db.execute(query)
    table = result.scalars().first()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
        
    for session in table.sessions:
        if session.status == "Active":
            session.status = "Completed"
            
    table.status = "Available"
    await db.commit()
    
    await manager.broadcast("TABLE_UPDATED", {
        "table_id": table.table_number,
        "status": "Available"
    }, ["operator", "waiter", "kitchen"])
    
    return {"message": "Table cleared successfully"}
