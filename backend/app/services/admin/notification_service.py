from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.system import Notification
from app.schemas.system import NotificationResponse
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    async def get_all_notifications(self, db: AsyncSession) -> List[Notification]:
        stmt = select(Notification).order_by(Notification.created_at.desc())
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_unread_count(self, db: AsyncSession) -> int:
        stmt = select(Notification).where(Notification.is_read == False)
        result = await db.execute(stmt)
        return len(result.scalars().all())

    async def mark_as_read(self, db: AsyncSession, notification_id: int) -> bool:
        stmt = update(Notification).where(Notification.id == notification_id).values(is_read=True)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    async def mark_all_as_read(self, db: AsyncSession) -> int:
        stmt = update(Notification).where(Notification.is_read == False).values(is_read=True)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount

notification_service = NotificationService()
