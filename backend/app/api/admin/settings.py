from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.settings import RestaurantSettingsUpdate, RestaurantSettingsResponse
from app.schemas.common import StandardResponse
from app.services.admin.settings_service import settings_service
from app.models.security import Admin
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/", response_model=StandardResponse[RestaurantSettingsResponse])
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    data = await settings_service.get_settings(db)
    return StandardResponse(data=data)

@router.put("/", response_model=StandardResponse[RestaurantSettingsResponse])
async def update_settings(
    settings_in: RestaurantSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    data = await settings_service.update_settings(db, settings_in)
    return StandardResponse(data=data)
