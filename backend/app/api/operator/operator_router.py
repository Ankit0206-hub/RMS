from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_operator
from app.models.security import Employee
from app.schemas.admin.employees import EmployeeUpdate, EmployeeResponse

router = APIRouter(prefix="/operator", tags=["Operator Portal"])

@router.get("/me")
async def get_me(current_user: Employee = Depends(get_current_operator)):
    return {"message": "Welcome Operator", "employee_code": current_user.employee_code}

@router.put("/me", response_model=EmployeeResponse)
async def update_me(
    update_data: EmployeeUpdate,
    current_user: Employee = Depends(get_current_operator),
    db: AsyncSession = Depends(get_db)
):
    if update_data.first_name is not None:
        current_user.first_name = update_data.first_name
    if update_data.last_name is not None:
        current_user.last_name = update_data.last_name
    if update_data.email is not None:
        current_user.email = update_data.email
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    
    # We do not allow changing role_id, password, or employee_code here,
    # or we handle them carefully if we wanted to.
    
    await db.commit()
    await db.refresh(current_user)
    
    # role_name property is handled if we load relations or we can just return it
    # We'll just return the updated user
    return current_user
