from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.security import Admin
from app.core.security import get_password_hash

class AdminRepository:
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[Admin]:
        result = await db.execute(select(Admin).filter(Admin.email == email))
        return result.scalar_one_or_none()

    async def create_initial_admin(self, db: AsyncSession, email: str, password: str) -> Admin:
        db_obj = Admin(
            email=email,
            hashed_password=get_password_hash(password),
            is_active=True
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

admin_repo = AdminRepository()
