from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.security import Employee
from app.schemas.admin.employees import EmployeeCreate, EmployeeUpdate
from app.core.security import get_password_hash
from sqlalchemy import func
from datetime import datetime

class EmployeeRepository:
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[Employee]:
        result = await db.execute(select(Employee).filter(Employee.email == email))
        return result.scalar_one_or_none()
        
    async def get_by_code(self, db: AsyncSession, code: str) -> Optional[Employee]:
        result = await db.execute(select(Employee).filter(Employee.employee_code == code))
        return result.scalar_one_or_none()
        
    async def get_by_id(self, db: AsyncSession, id: int) -> Optional[Employee]:
        result = await db.execute(select(Employee).filter(Employee.id == id))
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Employee]:
        from sqlalchemy.orm import selectinload
        result = await db.execute(select(Employee).options(selectinload(Employee.role)).order_by(Employee.id.desc()).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, employee_in: EmployeeCreate) -> Employee:
        db_obj = Employee(
            email=employee_in.email,
            hashed_password=get_password_hash(employee_in.password),
            first_name=employee_in.first_name,
            last_name=employee_in.last_name,
            phone=employee_in.phone,
            employee_code=employee_in.employee_code,
            role_id=employee_in.role_id,
            is_active=employee_in.is_active,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: Employee, obj_in: EmployeeUpdate) -> Employee:
        update_data = obj_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
        
    async def delete(self, db: AsyncSession, id: int) -> bool:
        result = await db.execute(select(Employee).filter(Employee.id == id))
        employee = result.scalar_one_or_none()
        if not employee:
            return False
        await db.delete(employee)
        await db.commit()
        return True
        
    async def get_kpis(self, db: AsyncSession) -> dict:
        total = await db.execute(select(func.count(Employee.id)))
        active = await db.execute(select(func.count(Employee.id)).filter(Employee.is_active == True))
        inactive = await db.execute(select(func.count(Employee.id)).filter(Employee.is_active == False))
        
        # Current month new employees
        now = datetime.now()
        new_this_month_query = select(func.count(Employee.id)).filter(
            func.extract('year', Employee.created_at) == now.year,
            func.extract('month', Employee.created_at) == now.month
        )
        new_this_month = await db.execute(new_this_month_query)
        
        return {
            "total_employees": total.scalar() or 0,
            "active_employees": active.scalar() or 0,
            "inactive_employees": inactive.scalar() or 0,
            "on_leave": 0, # Placeholder since no leave module exists yet
            "new_this_month": new_this_month.scalar() or 0
        }

employee_repo = EmployeeRepository()
