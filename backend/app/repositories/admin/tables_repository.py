from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.restaurant import RestaurantTable, TableAssignment
from app.schemas.admin.tables import TableCreate, TableUpdate

class TablesRepository:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[RestaurantTable]:
        # Include assignments
        from sqlalchemy.orm import selectinload
        result = await db.execute(select(RestaurantTable).options(selectinload(RestaurantTable.assignments)).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, table_id: int) -> Optional[RestaurantTable]:
        from sqlalchemy.orm import selectinload
        result = await db.execute(select(RestaurantTable).options(selectinload(RestaurantTable.assignments)).filter(RestaurantTable.id == table_id))
        return result.scalar_one_or_none()
        
    async def get_by_number(self, db: AsyncSession, table_number: str) -> Optional[RestaurantTable]:
        result = await db.execute(select(RestaurantTable).filter(RestaurantTable.table_number == table_number))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: TableCreate) -> RestaurantTable:
        db_obj = RestaurantTable(
            table_number=obj_in.table_number,
            name=obj_in.name,
            floor=obj_in.floor,
            capacity=obj_in.capacity,
            status=obj_in.status or "Available"
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: RestaurantTable, obj_in: TableUpdate) -> RestaurantTable:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, db_obj: RestaurantTable) -> None:
        await db.delete(db_obj)
        await db.commit()

    async def assign_waiter(self, db: AsyncSession, table_id: int, employee_id: int) -> TableAssignment:
        # Acquire a row lock on the parent table to prevent deadlocks from concurrent updates
        await db.execute(select(RestaurantTable.id).where(RestaurantTable.id == table_id).with_for_update())
        
        await db.execute(update(TableAssignment).where(TableAssignment.table_id == table_id).values(is_active=False))
        db_obj = TableAssignment(table_id=table_id, employee_id=employee_id, is_active=True)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def unassign_waiter(self, db: AsyncSession, table_id: int) -> None:
        await db.execute(select(RestaurantTable.id).where(RestaurantTable.id == table_id).with_for_update())
        await db.execute(update(TableAssignment).where(TableAssignment.table_id == table_id).values(is_active=False))
        await db.commit()

    async def clear_all_assignments(self, db: AsyncSession) -> None:
        await db.execute(update(TableAssignment).where(TableAssignment.is_active == True).values(is_active=False))
        await db.commit()

tables_repo = TablesRepository()
