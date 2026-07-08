from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.system import NotificationResponse
from app.schemas.common import StandardResponse
from app.services.admin.notification_service import notification_service
from app.models.security import Admin
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[NotificationResponse]])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    notifications = await notification_service.get_all_notifications(db)
    return StandardResponse(
        success=True,
        message="Notifications retrieved successfully",
        data=notifications
    )

@router.post("/{notification_id}/read", response_model=StandardResponse[bool])
async def mark_notification_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    success = await notification_service.mark_as_read(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return StandardResponse(
        success=True,
        message="Notification marked as read",
        data=True
    )

@router.post("/read-all", response_model=StandardResponse[int])
async def mark_all_as_read(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    count = await notification_service.mark_all_as_read(db)
    return StandardResponse(
        success=True,
        message=f"{count} notifications marked as read",
        data=count
    )
