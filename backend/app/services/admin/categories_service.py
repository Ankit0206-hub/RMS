from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.admin.categories import CategoryCreate, CategoryUpdate
from app.repositories.admin.categories_repository import category_repo
from app.models.menu import MenuCategory
from app.core.exceptions import BusinessException

class CategoryService:
    async def get_all_categories(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[MenuCategory]:
        return await category_repo.get_all(db, skip=skip, limit=limit)

    async def get_category(self, db: AsyncSession, category_id: int) -> MenuCategory:
        category = await category_repo.get_by_id(db, category_id)
        if not category:
            raise BusinessException(detail="Category not found", status_code=404)
        return category

    async def create_category(self, db: AsyncSession, obj_in: CategoryCreate) -> MenuCategory:
        existing = await category_repo.get_by_name(db, obj_in.name)
        if existing:
            raise BusinessException(detail="Category name already exists", status_code=409)
        return await category_repo.create(db, obj_in)

    async def update_category(self, db: AsyncSession, category_id: int, obj_in: CategoryUpdate) -> MenuCategory:
        category = await self.get_category(db, category_id)
        if obj_in.name and obj_in.name != category.name:
            existing = await category_repo.get_by_name(db, obj_in.name)
            if existing:
                raise BusinessException(detail="Category name already exists", status_code=409)
                
        return await category_repo.update(db, category, obj_in)

    async def delete_category(self, db: AsyncSession, category_id: int) -> None:
        category = await self.get_category(db, category_id)
        await category_repo.delete(db, category)

category_service = CategoryService()
