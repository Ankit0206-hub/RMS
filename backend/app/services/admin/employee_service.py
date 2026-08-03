from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.admin.employees import EmployeeCreate, EmployeeUpdate
from app.repositories.admin.employee_repository import employee_repo
from app.models.security import Employee

class EmployeeService:
    async def get_next_employee_code(self, db: AsyncSession, role_id: int) -> str:
        from app.services.admin.settings_service import settings_service
        import re
        
        settings = await settings_service.get_settings(db)
        restaurant_name = settings.restaurant_name.replace(' ', '') if settings and settings.restaurant_name else 'KVON'
        
        employees = await employee_repo.get_all(db, limit=10000)
        max_id = 0
        for e in employees:
            if e.employee_code:
                digits = re.sub(r'\D', '', e.employee_code)
                if digits:
                    num = int(digits)
                    if num > max_id:
                        max_id = num
            elif getattr(e, 'id', None) and e.id > max_id:
                max_id = e.id
                
        if role_id == 2:
            role_str = 'waiter'
        elif role_id == 3:
            role_str = 'kitchen'
        else:
            role_str = 'operator'
            
        return f"{restaurant_name}_{role_str}_{max_id + 1}"

    async def create_employee(self, db: AsyncSession, employee_in: EmployeeCreate) -> Employee:
        existing = await employee_repo.get_by_email(db, employee_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        if not employee_in.employee_code:
            employee_in.employee_code = await self.get_next_employee_code(db, employee_in.role_id)
            
        existing_code = await employee_repo.get_by_code(db, employee_in.employee_code)
        if existing_code:
            raise HTTPException(status_code=400, detail="Employee code already registered")
        
        return await employee_repo.create(db, employee_in)

    async def get_all_employees(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Employee]:
        return await employee_repo.get_all(db, skip=skip, limit=limit)
        
    async def get_employee(self, db: AsyncSession, employee_id: int) -> Employee:
        employee = await employee_repo.get_by_id(db, employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee
        
    async def update_employee(self, db: AsyncSession, employee_id: int, employee_in: EmployeeUpdate) -> Employee:
        employee = await self.get_employee(db, employee_id)
        
        # Check email uniqueness if email is being updated
        if employee_in.email is not None and employee_in.email != employee.email:
            existing = await employee_repo.get_by_email(db, employee_in.email)
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
                
        # Check code uniqueness if code is being updated
        if employee_in.employee_code is not None and employee_in.employee_code != employee.employee_code:
            existing_code = await employee_repo.get_by_code(db, employee_in.employee_code)
            if existing_code:
                raise HTTPException(status_code=400, detail="Employee code already registered")
                
        return await employee_repo.update(db, employee, employee_in)
        
    async def delete_employee(self, db: AsyncSession, employee_id: int) -> bool:
        deleted = await employee_repo.delete(db, employee_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Employee not found")
        return True
        
    async def get_employee_kpis(self, db: AsyncSession) -> dict:
        return await employee_repo.get_kpis(db)

    async def toggle_break(self, db: AsyncSession, employee_id: int, toggle_data: "EmployeeBreakToggle") -> "Employee":
        employee = await self.get_employee(db, employee_id)
        
        from app.models.restaurant import TableAssignment
        from sqlalchemy import select, update
        
        if toggle_data.is_on_break:
            employee.is_on_break = True
            
            result = await db.execute(select(TableAssignment).where(
                TableAssignment.employee_id == employee_id,
                TableAssignment.is_active == True
            ))
            assignments = result.scalars().all()
            
            table_ids = [a.table_id for a in assignments]
            employee.break_cover_data = {"table_ids": table_ids}
            
            if table_ids:
                if not toggle_data.cover_employee_id:
                    raise HTTPException(status_code=400, detail="Must provide cover_employee_id to take over tables")
                
                await db.execute(update(TableAssignment).where(
                    TableAssignment.employee_id == employee_id,
                    TableAssignment.is_active == True
                ).values(is_active=False))
                
                for tid in table_ids:
                    new_assign = TableAssignment(table_id=tid, employee_id=toggle_data.cover_employee_id, is_active=True)
                    db.add(new_assign)
                    
        else:
            employee.is_on_break = False
            data = employee.break_cover_data
            if data and isinstance(data, dict) and "table_ids" in data:
                table_ids = data["table_ids"]
                if table_ids:
                    await db.execute(update(TableAssignment).where(
                        TableAssignment.table_id.in_(table_ids),
                        TableAssignment.is_active == True
                    ).values(is_active=False))
                    
                    for tid in table_ids:
                        new_assign = TableAssignment(table_id=tid, employee_id=employee_id, is_active=True)
                        db.add(new_assign)
                        
            employee.break_cover_data = None
            
        await db.commit()
        return await self.get_employee(db, employee_id)

employee_service = EmployeeService()
