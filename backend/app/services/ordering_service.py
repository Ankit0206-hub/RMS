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
            
        return await self.repository.create_session(db, session_in.model_dump())

    async def get_sessions(self, db: AsyncSession, page: int, page_size: int, status: str = None):
        return await self.repository.get_sessions(db, page, page_size, status)

    async def get_session(self, db: AsyncSession, session_id: int):
        session = await self.repository.get_session_by_id(db, session_id)
        if not session:
            raise NotFoundException("Session not found")
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
        }, target_roles=["operator", "waiter", "admin"])
        
        # Notify specific customer who placed the order
        await manager.notify_customer(order.session_id, "order.created", {
            "id": order.id,
            "status": order.status
        })
        
        return order

    async def get_orders(self, db: AsyncSession, page: int, page_size: int, status: str = None):
        return await self.repository.get_orders(db, page, page_size, status)
        
    async def get_order(self, db: AsyncSession, order_id: int):
        order = await self.repository.get_order_by_id(db, order_id)
        if not order:
            raise NotFoundException("Order not found")
        return order
        
    async def update_order_status(self, db: AsyncSession, order_id: int, status_update: OrderStatusUpdate):
        valid_statuses = ["Pending", "Confirmed", "Cooked", "Served", "Completed", "Cancelled"]
        if status_update.status not in valid_statuses:
            raise BusinessRuleException("Invalid status")
            
        order = await self.repository.update_order_status(db, order_id, status_update.status)
        if not order:
            raise NotFoundException("Order not found")
            
        await manager.broadcast("order.updated", {
            "id": order.id,
            "session_id": order.session_id,
            "status": order.status
        }, target_roles=["operator", "waiter", "admin"])
        
        await manager.notify_customer(order.session_id, "order.updated", {
            "id": order.id,
            "status": order.status
        })
            
        return order
