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

employee_service = EmployeeService()
