from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_operator
from app.models.security import Employee

router = APIRouter(prefix="/operator", tags=["Operator Portal"])

@router.get("/me")
async def get_me(current_user: Employee = Depends(get_current_operator)):
    return {"message": "Welcome Operator", "employee_code": current_user.employee_code}
