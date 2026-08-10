from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.admin.roles import RoleCreate, RoleUpdate
from app.repositories.admin.role_repository import role_repo
from app.models.security import Role
from app.core.exceptions import BusinessException

class RoleService:
    async def get_all_roles(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Role]:
        return await role_repo.get_all(db, skip=skip, limit=limit)

    async def get_role(self, db: AsyncSession, role_id: int) -> Role:
        role = await role_repo.get_by_id(db, role_id)
        if not role:
            raise BusinessException(detail="Role not found", status_code=404)
        return role

    async def create_role(self, db: AsyncSession, obj_in: RoleCreate) -> Role:
        existing = await role_repo.get_by_name(db, obj_in.name)
        if existing:
            raise BusinessException(detail="Role with this name already exists", status_code=409)
        return await role_repo.create(db, obj_in)

    async def update_role(self, db: AsyncSession, role_id: int, obj_in: RoleUpdate) -> Role:
        role = await self.get_role(db, role_id)
        if obj_in.name and obj_in.name.lower() != role.name.lower():
            existing = await role_repo.get_by_name(db, obj_in.name)
            if existing:
                raise BusinessException(detail="Role with this name already exists", status_code=409)
        return await role_repo.update(db, role, obj_in)

    async def delete_role(self, db: AsyncSession, role_id: int) -> None:
        role = await self.get_role(db, role_id)
        # Prevent deletion of core roles if necessary, e.g. ids 1, 2, 3
        if role.id in [1, 2, 3]:
            raise BusinessException(detail="Cannot delete core system roles", status_code=400)
        await role_repo.delete(db, role)

role_service = RoleService()
