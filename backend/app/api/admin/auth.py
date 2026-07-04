from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.auth import Login, Token
from app.schemas.common import StandardResponse
from app.services.admin.auth_service import auth_service

router = APIRouter()

@router.post("/login", response_model=StandardResponse[Token])
async def login(login_data: Login, db: AsyncSession = Depends(get_db)):
    data = await auth_service.authenticate(db, login_data)
    return StandardResponse(data=data)
