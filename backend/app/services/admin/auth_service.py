from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.admin.auth import Login, Token
from app.repositories.admin.admin_repository import admin_repo
from app.core.security import verify_password, create_access_token
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.models.security import Employee

class AuthService:
    async def authenticate(self, db: AsyncSession, login_data: Login) -> Token:
        # Check if admin
        admin = await admin_repo.get_by_email(db, login_data.email)
        if admin:
            if not verify_password(login_data.password, admin.hashed_password):
                raise HTTPException(status_code=400, detail="Incorrect email or password")
            if not admin.is_active:
                raise HTTPException(status_code=400, detail="Inactive user")
            
            access_token = create_access_token(subject=admin.id, role="admin")
            return Token(access_token=access_token, token_type="bearer", role="admin")
            
        # Check if employee
        stmt = select(Employee).options(selectinload(Employee.role)).where(Employee.email == login_data.email)
        result = await db.execute(stmt)
        employee = result.scalar_one_or_none()
        
        if employee:
            if not verify_password(login_data.password, employee.hashed_password):
                raise HTTPException(status_code=400, detail="Incorrect email or password")
            if not employee.is_active:
                raise HTTPException(status_code=400, detail="Inactive user")
            
            role_name = employee.role.name.lower() if employee.role else "employee"
            if role_name == "kitchen staff":
                role_name = "kitchen"
                
            access_token = create_access_token(subject=employee.id, role="employee") # we keep role as employee in JWT for deps, but we can pass actual role to frontend
            return Token(access_token=access_token, token_type="bearer", role=role_name)

        raise HTTPException(status_code=400, detail="Incorrect email or password")

auth_service = AuthService()
