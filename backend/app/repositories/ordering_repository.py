from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.ordering import CustomerSession, Order, OrderItem
from app.models.restaurant import RestaurantTable
from app.models.menu import MenuItem

class OrderingRepository:
    async def create_session(self, db: AsyncSession, session_data: dict) -> CustomerSession:
        db_session = CustomerSession(**session_data)
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)
        return db_session

    async def get_active_session_by_table(self, db: AsyncSession, table_id: int) -> Optional[CustomerSession]:
        stmt = select(CustomerSession).where(
            CustomerSession.table_id == table_id,
            CustomerSession.status == "Active"
        )
        result = await db.execute(stmt)
        return result.scalars().first()
    
    async def get_session_by_id(self, db: AsyncSession, session_id: int) -> Optional[CustomerSession]:
        stmt = select(CustomerSession).options(
            selectinload(CustomerSession.orders).selectinload(Order.items)
        ).where(CustomerSession.id == session_id)
        result = await db.execute(stmt)
        return result.scalars().first()
    
    async def get_sessions(self, db: AsyncSession, page: int, page_size: int, status: Optional[str] = None) -> Tuple[List[CustomerSession], int]:
        stmt = select(CustomerSession).options(selectinload(CustomerSession.orders).selectinload(Order.items))
        count_stmt = select(func.count(CustomerSession.id))
        
        if status:
            stmt = stmt.where(CustomerSession.status == status)
            count_stmt = count_stmt.where(CustomerSession.status == status)
            
        total = await db.scalar(count_stmt)
        
        stmt = stmt.order_by(CustomerSession.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(stmt)
        return result.scalars().all(), total

    async def create_order(self, db: AsyncSession, order_data: dict, items_data: List[dict]) -> Order:
        db_order = Order(**order_data)
        db.add(db_order)
        await db.flush()
        
        for item in items_data:
            db_item = OrderItem(order_id=db_order.id, **item)
            db.add(db_item)
            
        await db.commit()
        await db.refresh(db_order)
        
        # Load relationships for return
        stmt = select(Order).options(selectinload(Order.items)).where(Order.id == db_order.id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_orders(self, db: AsyncSession, page: int, page_size: int, status: Optional[str] = None) -> Tuple[List[Order], int]:
        stmt = select(Order).options(
            selectinload(Order.items).selectinload(OrderItem.menu_item).selectinload(MenuItem.category),
            selectinload(Order.items).selectinload(OrderItem.menu_item).selectinload(MenuItem.images),
            selectinload(Order.session).selectinload(CustomerSession.table)
        )
        count_stmt = select(func.count(Order.id))
        
        if status:
            stmt = stmt.where(Order.status == status)
            count_stmt = count_stmt.where(Order.status == status)
            
        total = await db.scalar(count_stmt)
        
        stmt = stmt.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(stmt)
        return result.scalars().all(), total

    async def get_order_by_id(self, db: AsyncSession, order_id: int) -> Optional[Order]:
        stmt = select(Order).options(
            selectinload(Order.items).selectinload(OrderItem.menu_item).selectinload(MenuItem.category),
            selectinload(Order.items).selectinload(OrderItem.menu_item).selectinload(MenuItem.images),
            selectinload(Order.session).selectinload(CustomerSession.table)
        ).where(Order.id == order_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def update_order_status(self, db: AsyncSession, order_id: int, status: str) -> Optional[Order]:
        stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
        result = await db.execute(stmt)
        order = result.scalars().first()
        if order:
            order.status = status
            await db.commit()
            await db.refresh(order)
        return order
