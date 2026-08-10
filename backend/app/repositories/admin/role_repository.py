from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.security import Role
from app.schemas.admin.roles import RoleCreate, RoleUpdate

class RoleRepository:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Role]:
        result = await db.execute(select(Role).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, role_id: int) -> Optional[Role]:
        result = await db.execute(select(Role).filter(Role.id == role_id))
        return result.scalar_one_or_none()

    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[Role]:
        result = await db.execute(select(Role).filter(Role.name.ilike(name)))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: RoleCreate) -> Role:
        db_obj = Role(
            name=obj_in.name,
            description=obj_in.description
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: Role, obj_in: RoleUpdate) -> Role:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, db_obj: Role) -> None:
        await db.delete(db_obj)
        await db.commit()

role_repo = RoleRepository()
