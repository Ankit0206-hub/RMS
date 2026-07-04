from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.admin.tables import TableCreate, TableUpdate
from app.repositories.admin.tables_repository import tables_repo
from app.models.restaurant import RestaurantTable

class TablesService:
    async def get_all_tables(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        from app.models.ordering import CustomerSession, Order, OrderItem
        from sqlalchemy import func
        from sqlalchemy.future import select

        tables = await tables_repo.get_all(db, skip=skip, limit=limit)
        table_ids = [t.id for t in tables]
        
        active_orders_map = {}
        if table_ids:
            stmt = (
                select(
                    CustomerSession.table_id, 
                    CustomerSession.id.label('session_id'),
                    func.sum(OrderItem.price_at_order * OrderItem.quantity).label('total_amount')
                )
                .join(Order, Order.session_id == CustomerSession.id)
                .join(OrderItem, OrderItem.order_id == Order.id)
                .where(CustomerSession.status == "Active")
                .where(CustomerSession.table_id.in_(table_ids))
                .group_by(CustomerSession.table_id, CustomerSession.id)
            )
            result = await db.execute(stmt)
            for row in result.all():
                active_orders_map[row.table_id] = {
                    "session_id": f"#ORD{row.session_id}",
                    "amount": f"₹ {float(row.total_amount or 0):,.2f}"
                }

        for t in tables:
            active_order = active_orders_map.get(t.id)
            if active_order:
                setattr(t, 'current_order_id', active_order["session_id"])
                setattr(t, 'current_order_amount', active_order["amount"])
            else:
                setattr(t, 'current_order_id', None)
                setattr(t, 'current_order_amount', None)

        return tables

    async def get_table(self, db: AsyncSession, table_id: int) -> RestaurantTable:
        table = await tables_repo.get_by_id(db, table_id)
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        return table

    async def create_table(self, db: AsyncSession, obj_in: TableCreate) -> RestaurantTable:
        existing = await tables_repo.get_by_number(db, obj_in.table_number)
        if existing:
            raise HTTPException(status_code=409, detail="Table number already exists")
        return await tables_repo.create(db, obj_in)

    async def update_table(self, db: AsyncSession, table_id: int, obj_in: TableUpdate) -> RestaurantTable:
        table = await self.get_table(db, table_id)
        if obj_in.table_number and obj_in.table_number != table.table_number:
            existing = await tables_repo.get_by_number(db, obj_in.table_number)
            if existing:
                raise HTTPException(status_code=409, detail="Table number already exists")
                
        return await tables_repo.update(db, table, obj_in)

    async def delete_table(self, db: AsyncSession, table_id: int) -> None:
        table = await self.get_table(db, table_id)
        await tables_repo.delete(db, table)

    async def assign_waiter(self, db: AsyncSession, table_id: int, employee_id: int):
        table = await self.get_table(db, table_id)
        return await tables_repo.assign_waiter(db, table.id, employee_id)

tables_service = TablesService()
