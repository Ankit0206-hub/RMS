from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Tuple
from app.repositories.ordering_repository import OrderingRepository
from app.repositories.admin.tables_repository import TablesRepository
from app.repositories.admin.menu_repository import MenuRepository
from app.schemas.ordering import CustomerSessionCreate, OrderCreate, OrderStatusUpdate
from app.core.exceptions import NotFoundException, BusinessRuleException
from datetime import datetime
from app.websocket.connection_manager import manager

class OrderingService:
    def __init__(self):
        self.repository = OrderingRepository()
        self.table_repository = TablesRepository()
        self.menu_repository = MenuRepository()

    async def create_session(self, db: AsyncSession, session_in: CustomerSessionCreate):
        table = await self.table_repository.get_by_id(db, session_in.table_id)
        if not table:
            raise NotFoundException("Table not found")
        
        active_session = await self.repository.get_active_session_by_table(db, session_in.table_id)
        if active_session:
            raise BusinessRuleException("Table already has an active session")
            
        table.status = "Occupied"
        db.add(table)
        
        session = await self.repository.create_session(db, session_in.model_dump())
        return await self.get_session(db, session.id)

    async def get_sessions(self, db: AsyncSession, page: int, page_size: int, status: str = None):
        sessions, total = await self.repository.get_sessions(db, page, page_size, status)
        for session in sessions:
            for order in session.orders:
                order.total_amount = sum(float(item.price_at_order) * item.quantity for item in order.items)
                for item in order.items:
                    if getattr(item, 'menu_item', None):
                        item.menu_item_name = item.menu_item.name
                        item.menu_item_category = item.menu_item.category.name if getattr(item.menu_item, 'category', None) else "Uncategorized"
                        if getattr(item.menu_item, 'images', None) and len(item.menu_item.images) > 0:
                            primary_img = next((img for img in item.menu_item.images if img.is_primary), item.menu_item.images[0])
                            item.menu_item_image = primary_img.image_url
                        else:
                            item.menu_item_image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
        return sessions, total

    async def get_session(self, db: AsyncSession, session_id: int):
        session = await self.repository.get_session_by_id(db, session_id)
        if not session:
            raise NotFoundException("Session not found")
        for order in session.orders:
            order.total_amount = sum(float(item.price_at_order) * item.quantity for item in order.items)
            for item in order.items:
                if getattr(item, 'menu_item', None):
                    item.menu_item_name = item.menu_item.name
                    item.menu_item_category = item.menu_item.category.name if getattr(item.menu_item, 'category', None) else "Uncategorized"
                    if getattr(item.menu_item, 'images', None) and len(item.menu_item.images) > 0:
                        primary_img = next((img for img in item.menu_item.images if img.is_primary), item.menu_item.images[0])
                        item.menu_item_image = primary_img.image_url
                    else:
                        item.menu_item_image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
        return session

    async def create_order(self, db: AsyncSession, order_in: OrderCreate, waiter_id: int = None):
        session = await self.repository.get_session_by_id(db, order_in.session_id)
        if not session:
            raise NotFoundException("Session not found")
        if session.status != "Active":
            raise BusinessRuleException("Cannot place order for an inactive session")

        # Validate menu items and calculate price
        items_data = []
        for item_in in order_in.items:
            menu_item = await self.menu_repository.get_by_id(db, item_in.menu_item_id)
            if not menu_item:
                raise NotFoundException(f"Menu item {item_in.menu_item_id} not found")
            if not menu_item.is_available:
                raise BusinessRuleException(f"Menu item {menu_item.name} is currently unavailable")
            if item_in.quantity <= 0:
                raise BusinessRuleException("Quantity must be greater than 0")
                
            items_data.append({
                "menu_item_id": menu_item.id,
                "quantity": item_in.quantity,
                "price_at_order": menu_item.price,
                "notes": item_in.notes
            })

        order_data = {
            "session_id": session.id,
            "waiter_id": waiter_id,
            "special_instructions": order_in.special_instructions,
            "status": "Pending"
        }

        order = await self.repository.create_order(db, order_data, items_data)
        
        # Broadcast the event to operators and waiters
        await manager.broadcast("order.created", {
            "id": order.id,
            "session_id": order.session_id,
            "status": order.status
        }, target_roles=["operator", "waiter", "admin", "kitchen"])
        
        # Notify specific customer who placed the order
        await manager.notify_customer(order.session_id, "order.created", {
            "id": order.id,
            "status": order.status
        })
        
        return order

    async def get_orders(self, db: AsyncSession, page: int, page_size: int, status: str = None):
        orders, total = await self.repository.get_orders(db, page, page_size, status)
        
        # Map related fields for frontend
        for order in orders:
            if order.session:
                order.customer_name = order.session.customer_name or "Walk-in Customer"
                order.customer_phone = order.session.customer_phone or "-"
                if order.session.table:
                    order.table_number = f"{order.session.table.table_number} - {order.session.table.name}" if order.session.table.name else order.session.table.table_number
                    order.order_type = "Dine In"
                else:
                    order.order_type = "Take Away" # We could also add logic for "Walk-in"
            
            # Calculate total amount
            order.total_amount = sum(float(item.price_at_order) * item.quantity for item in order.items)
            
            for item in order.items:
                if getattr(item, 'menu_item', None):
                    item.menu_item_name = item.menu_item.name
                    item.menu_item_category = item.menu_item.category.name if getattr(item.menu_item, 'category', None) else "Uncategorized"
                    # Get primary image or first image
                    if getattr(item.menu_item, 'images', None) and len(item.menu_item.images) > 0:
                        primary_img = next((img for img in item.menu_item.images if img.is_primary), item.menu_item.images[0])
                        item.menu_item_image = primary_img.image_url
                    else:
                        item.menu_item_image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop" # Default fallback
            
        return orders, total
        
    async def get_order(self, db: AsyncSession, order_id: int):
        order = await self.repository.get_order_by_id(db, order_id)
        if not order:
            raise NotFoundException("Order not found")
            
        if order.session:
            order.customer_name = order.session.customer_name or "Walk-in Customer"
            order.customer_phone = order.session.customer_phone or "-"
            if order.session.table:
                order.table_number = f"{order.session.table.table_number} - {order.session.table.name}" if order.session.table.name else order.session.table.table_number
                order.order_type = "Dine In"
            else:
                order.order_type = "Take Away"
                
        order.total_amount = sum(float(item.price_at_order) * item.quantity for item in order.items)
        
        for item in order.items:
            if getattr(item, 'menu_item', None):
                item.menu_item_name = item.menu_item.name
                item.menu_item_category = item.menu_item.category.name if getattr(item.menu_item, 'category', None) else "Uncategorized"
                if getattr(item.menu_item, 'images', None) and len(item.menu_item.images) > 0:
                    primary_img = next((img for img in item.menu_item.images if img.is_primary), item.menu_item.images[0])
                    item.menu_item_image = primary_img.image_url
                else:
                    item.menu_item_image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                    
        return order
        
    async def update_order_status(self, db: AsyncSession, order_id: int, status_update: OrderStatusUpdate):
        valid_statuses = ["Pending", "Confirmed", "Preparing", "Cooked", "Served", "Completed", "Cancelled"]
        if status_update.status not in valid_statuses:
            raise BusinessRuleException("Invalid status")
            
        order = await self.repository.update_order_status(db, order_id, status_update.status)
        if not order:
            raise NotFoundException("Order not found")
            
        if status_update.status == "Cooked":
            from app.models.system import Notification
            from app.models.restaurant import TableAssignment
            from sqlalchemy.future import select
            
            full_order = await self.repository.get_order_by_id(db, order_id)
            if full_order and full_order.session and full_order.session.table:
                assignments_query = select(TableAssignment).where(
                    TableAssignment.table_id == full_order.session.table_id,
                    TableAssignment.is_active == True
                )
                assignments_result = await db.execute(assignments_query)
                assignments = assignments_result.scalars().all()
                for assign in assignments:
                    notif = Notification(
                        employee_id=assign.employee_id,
                        title="Order Ready",
                        message=f"Table {full_order.session.table.table_number}'s order #{order.id} is ready to serve",
                        notification_type="ORDER_READY",
                        is_read=False
                    )
                    db.add(notif)
                await db.commit()
                await manager.broadcast("NEW_NOTIFICATION", {}, ["waiter"])
            
        await manager.broadcast("order.updated", {
            "id": order.id,
            "session_id": order.session_id,
            "status": order.status
        }, target_roles=["operator", "waiter", "admin", "kitchen"])
        
        await manager.notify_customer(order.session_id, "order.updated", {
            "id": order.id,
            "status": order.status
        })
            
        return order
