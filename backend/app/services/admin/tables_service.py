from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.admin.tables import TableCreate, TableUpdate
from app.repositories.admin.tables_repository import tables_repo
from app.models.restaurant import RestaurantTable

class TablesService:
    async def get_all_tables(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        from app.models.ordering import CustomerSession, Order, OrderItem
        from app.models.restaurant import TableAssignment
        from app.models.security import Employee
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
            
            # Fetch active table assignments
            assignment_stmt = (
                select(
                    TableAssignment.table_id,
                    TableAssignment.employee_id,
                    Employee.first_name,
                    Employee.last_name
                )
                .join(Employee, Employee.id == TableAssignment.employee_id)
                .where(TableAssignment.table_id.in_(table_ids))
                .where(TableAssignment.is_active == True)
            )
            assignment_result = await db.execute(assignment_stmt)
            assignments_map = {}
            for row in assignment_result.all():
                assignments_map[row.table_id] = {
                    "employee_id": row.employee_id,
                    "full_name": f"{row.first_name} {row.last_name}".strip()
                }

        for t in tables:
            active_order = active_orders_map.get(t.id)
            if active_order:
                setattr(t, 'current_order_id', active_order["session_id"])
                setattr(t, 'current_order_amount', active_order["amount"])
            else:
                setattr(t, 'current_order_id', None)
                setattr(t, 'current_order_amount', None)

            assignment = assignments_map.get(t.id) if 'assignments_map' in locals() else None
            if assignment:
                setattr(t, 'assigned_waiter_id', assignment["employee_id"])
                setattr(t, 'assigned_waiter_name', assignment["full_name"])
            else:
                setattr(t, 'assigned_waiter_id', None)
                setattr(t, 'assigned_waiter_name', None)

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

    async def unassign_waiter(self, db: AsyncSession, table_id: int):
        table = await self.get_table(db, table_id)
        await tables_repo.unassign_waiter(db, table.id)

    async def clear_all_assignments(self, db: AsyncSession):
        await tables_repo.clear_all_assignments(db)

    async def transfer_table(self, db: AsyncSession, source_table_id: int, target_table_id: int):
        from app.models.ordering import CustomerSession
        from app.models.restaurant import TableAssignment
        from app.schemas.admin.tables import TableUpdate
        from sqlalchemy.future import select
        from sqlalchemy import update
        from fastapi import HTTPException
        
        if source_table_id == target_table_id:
            raise HTTPException(status_code=400, detail="Source and target tables cannot be the same")
            
        source_table = await self.get_table(db, source_table_id)
        target_table = await self.get_table(db, target_table_id)
        
        # Check if target table is occupied or has an active session
        if target_table.status != "Available":
            raise HTTPException(status_code=400, detail="Target table is not available")
            
        active_target_session = await db.execute(
            select(CustomerSession).where(CustomerSession.table_id == target_table_id, CustomerSession.status == "Active")
        )
        if active_target_session.scalars().first():
            raise HTTPException(status_code=400, detail="Target table already has an active customer session")
            
        # 1. Transfer active session
        await db.execute(
            update(CustomerSession)
            .where(CustomerSession.table_id == source_table_id, CustomerSession.status == "Active")
            .values(table_id=target_table_id)
        )
        
        # 2. Transfer active waiter assignment
        active_assignment = await db.execute(
            select(TableAssignment).where(TableAssignment.table_id == source_table_id, TableAssignment.is_active == True)
        )
        assignment = active_assignment.scalars().first()
        if assignment:
            # unassign source
            await tables_repo.unassign_waiter(db, source_table_id)
            # assign target
            await tables_repo.assign_waiter(db, target_table_id, assignment.employee_id)
            
        # 3. Update table statuses
        # we need to skip the uniqueness check for name in the repo or just pass status
        await tables_repo.update(db, target_table, TableUpdate(status=source_table.status))
        await tables_repo.update(db, source_table, TableUpdate(status="Available"))
        
        await db.commit()

    async def merge_tables(self, db: AsyncSession, table_ids: List[int]) -> RestaurantTable:
        from sqlalchemy.future import select
        
        result = await db.execute(select(RestaurantTable).where(RestaurantTable.id.in_(table_ids)))
        tables = result.scalars().all()
        
        if len(tables) != len(table_ids):
            raise HTTPException(status_code=400, detail="Some tables not found")
            
        if len(tables) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 tables to merge")
            
        for t in tables:
            if t.status != "Available":
                raise HTTPException(status_code=400, detail=f"Table {t.table_number} is not Available")
            if t.is_virtual:
                raise HTTPException(status_code=400, detail=f"Table {t.table_number} is already a merged table")
                
        combined_name = "+".join(sorted([t.table_number for t in tables]))
        combined_capacity = sum([t.capacity for t in tables])
        
        # Find next available M-number
        virtual_result = await db.execute(select(RestaurantTable).where(RestaurantTable.is_virtual == True))
        virtual_tables = virtual_result.scalars().all()
        
        existing_m_numbers = []
        for vt in virtual_tables:
            if vt.table_number and vt.table_number.startswith('M'):
                try:
                    existing_m_numbers.append(int(vt.table_number.replace('M', '')))
                except ValueError:
                    pass
                    
        next_m_number = 1
        while next_m_number in existing_m_numbers:
            next_m_number += 1
            
        combined_number = f"M{next_m_number}"
        
        virtual_table = RestaurantTable(
            table_number=combined_number,
            name=combined_name,
            capacity=combined_capacity,
            status="Available",
            is_virtual=True,
            floor=tables[0].floor
        )
        db.add(virtual_table)
        await db.commit()
        await db.refresh(virtual_table)
        
        for t in tables:
            t.parent_table_id = virtual_table.id
            t.status = "Merged"
        
        await db.commit()
        await db.refresh(virtual_table)
        return virtual_table

    async def unmerge_table(self, db: AsyncSession, table_id: int):
        from sqlalchemy.future import select
        
        virtual_table = await self.get_table(db, table_id)
        if not virtual_table.is_virtual:
            raise HTTPException(status_code=400, detail="Only virtual (merged) tables can be unmerged")
            
        if virtual_table.status != "Available":
            raise HTTPException(status_code=400, detail="Table must be Available to unmerge")
            
        result = await db.execute(select(RestaurantTable).where(RestaurantTable.parent_table_id == virtual_table.id))
        children = result.scalars().all()
        
        for t in children:
            t.parent_table_id = None
            t.status = "Available"
            
        await db.delete(virtual_table)
        await db.commit()

    async def batch_update_tables(self, db: AsyncSession, updates: List[dict]):
        from sqlalchemy.future import select
        
        table_ids = [u["id"] for u in updates]
        result = await db.execute(select(RestaurantTable).where(RestaurantTable.id.in_(table_ids)))
        tables = {t.id: t for t in result.scalars().all()}
        
        for update_data in updates:
            table = tables.get(update_data["id"])
            if table:
                if "x_position" in update_data and update_data["x_position"] is not None:
                    table.x_position = update_data["x_position"]
                if "y_position" in update_data and update_data["y_position"] is not None:
                    table.y_position = update_data["y_position"]
                    
        await db.commit()
        return True

tables_service = TablesService()
