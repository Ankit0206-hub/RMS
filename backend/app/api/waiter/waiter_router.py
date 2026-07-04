from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_waiter
from app.models.security import Employee

router = APIRouter(prefix="/waiter", tags=["Waiter Portal"])

@router.get("/me")
async def get_me(current_user: Employee = Depends(get_current_waiter)):
    return {"message": "Welcome Waiter", "employee_code": current_user.employee_code}
