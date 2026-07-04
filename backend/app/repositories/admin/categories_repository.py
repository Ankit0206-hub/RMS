from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.menu import MenuCategory
from app.schemas.admin.categories import CategoryCreate, CategoryUpdate

class CategoryRepository:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[MenuCategory]:
        result = await db.execute(select(MenuCategory).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, category_id: int) -> Optional[MenuCategory]:
        result = await db.execute(select(MenuCategory).filter(MenuCategory.id == category_id))
        return result.scalar_one_or_none()
        
    async def get_by_name(self, db: AsyncSession, name: str) -> Optional[MenuCategory]:
        result = await db.execute(select(MenuCategory).filter(MenuCategory.name == name))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: CategoryCreate) -> MenuCategory:
        db_obj = MenuCategory(
            name=obj_in.name,
            description=obj_in.description,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: MenuCategory, obj_in: CategoryUpdate) -> MenuCategory:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, db_obj: MenuCategory) -> None:
        await db.delete(db_obj)
        await db.commit()

category_repo = CategoryRepository()
