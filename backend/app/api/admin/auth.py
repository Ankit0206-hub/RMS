from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.auth import Login, Token
from app.schemas.common import StandardResponse
from app.services.admin.auth_service import auth_service
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=StandardResponse[Token])
async def login(login_data: Login, db: AsyncSession = Depends(get_db)):
    data = await auth_service.authenticate(db, login_data)
    return StandardResponse(data=data)

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = current_user["user"]
    role = current_user["role"]
    if role == "employee":
        return StandardResponse(data={
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role_name.lower() if user.role_name else "employee"
        })
    elif role == "admin":
        return StandardResponse(data={
            "id": user.id,
            "first_name": "Admin",
            "last_name": "User",
            "email": user.email,
            "role": "admin"
        })
