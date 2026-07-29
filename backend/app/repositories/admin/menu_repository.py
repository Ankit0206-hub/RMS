from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, extract
from datetime import datetime
from app.models.menu import MenuItem, MenuCategory, FoodImage
from app.schemas.admin.menu import MenuItemCreate, MenuItemUpdate

class MenuRepository:
    async def get_kpis(self, db: AsyncSession) -> dict:
        total_items = await db.execute(select(func.count(MenuItem.id)))
        active_items = await db.execute(select(func.count(MenuItem.id)).where(MenuItem.is_active == True))
        inactive_items = await db.execute(select(func.count(MenuItem.id)).where(MenuItem.is_active == False))
        out_of_stock = await db.execute(select(func.count(MenuItem.id)).where(MenuItem.is_available == False))
        total_categories = await db.execute(select(func.count(MenuCategory.id)))
        
        current_date = datetime.utcnow()
        new_this_month_items = await db.execute(
            select(func.count(MenuItem.id))
            .where(extract('month', MenuItem.created_at) == current_date.month)
            .where(extract('year', MenuItem.created_at) == current_date.year)
        )
        new_this_month_categories = await db.execute(
            select(func.count(MenuCategory.id))
            .where(extract('month', MenuCategory.created_at) == current_date.month)
            .where(extract('year', MenuCategory.created_at) == current_date.year)
        )

        return {
            "total_items": total_items.scalar(),
            "active_items": active_items.scalar(),
            "inactive_items": inactive_items.scalar(),
            "out_of_stock": out_of_stock.scalar(),
            "total_categories": total_categories.scalar(),
            "new_items_this_month": new_this_month_items.scalar(),
            "new_categories_this_month": new_this_month_categories.scalar()
        }

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100, category_id: Optional[int] = None) -> List[MenuItem]:
        query = select(MenuItem).options(selectinload(MenuItem.category))
        if category_id is not None:
            query = query.filter(MenuItem.category_id == category_id)
        
        result = await db.execute(query.offset(skip).limit(limit))
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, item_id: int) -> Optional[MenuItem]:
        result = await db.execute(
            select(MenuItem).options(selectinload(MenuItem.category)).filter(MenuItem.id == item_id)
        )
        return result.scalar_one_or_none()
        
    async def get_by_code(self, db: AsyncSession, item_code: str) -> Optional[MenuItem]:
        result = await db.execute(select(MenuItem).filter(MenuItem.item_code == item_code))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: MenuItemCreate) -> MenuItem:
        db_obj = MenuItem(
            category_id=obj_in.category_id,
            item_code=obj_in.item_code,
            name=obj_in.name,
            description=obj_in.description,
            price=obj_in.price,
            half_price=obj_in.half_price,
            is_active=obj_in.is_active,
            is_available=obj_in.is_available,
            is_veg=obj_in.is_veg,
            is_spicy_customizable=obj_in.is_spicy_customizable,
            kitchen_id=obj_in.kitchen_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        if getattr(obj_in, 'image_url', None):
            food_image = FoodImage(menu_item_id=db_obj.id, image_url=obj_in.image_url, is_primary=True)
            db.add(food_image)
            await db.commit()
            
        return await self.get_by_id(db, db_obj.id)

    async def create_bulk(self, db: AsyncSession, objs_in: List[MenuItemCreate]) -> List[MenuItem]:
        db_objs = [
            MenuItem(
                category_id=obj.category_id,
                item_code=obj.item_code,
                name=obj.name,
                description=obj.description,
                price=obj.price,
                half_price=obj.half_price,
                is_active=obj.is_active,
                is_available=obj.is_available,
                is_veg=obj.is_veg,
                is_spicy_customizable=obj.is_spicy_customizable,
                kitchen_id=obj.kitchen_id
            ) for obj in objs_in
        ]
        db.add_all(db_objs)
        await db.commit()
        
        for obj_in, db_obj in zip(objs_in, db_objs):
            if getattr(obj_in, 'image_url', None):
                food_image = FoodImage(menu_item_id=db_obj.id, image_url=obj_in.image_url, is_primary=True)
                db.add(food_image)
        await db.commit()
        
        # Refresh and load relations is a bit tricky for bulk in SQLAlchemy.
        # But we can just return the newly created objects (ids might not be perfectly hydrated on SQLite if we don't fetch them back, but let's assume they are populated on flush/commit)
        # To be perfectly safe, we can fetch them by their codes.
        codes = [obj.item_code for obj in objs_in]
        result = await db.execute(
            select(MenuItem).options(selectinload(MenuItem.category), selectinload(MenuItem.images)).filter(MenuItem.item_code.in_(codes))
        )
        return result.scalars().all()

    async def update(self, db: AsyncSession, db_obj: MenuItem, obj_in: MenuItemUpdate) -> MenuItem:
        update_data = obj_in.model_dump(exclude_unset=True, exclude={"image_url"})
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        await db.commit()
        await db.refresh(db_obj)
        
        if getattr(obj_in, 'image_url', None) is not None:
            # Delete existing images
            delete_img_stmt = select(FoodImage).where(FoodImage.menu_item_id == db_obj.id)
            img_result = await db.execute(delete_img_stmt)
            for img in img_result.scalars().all():
                await db.delete(img)
            
            # Add new image
            food_image = FoodImage(menu_item_id=db_obj.id, image_url=obj_in.image_url, is_primary=True)
            db.add(food_image)
            await db.commit()
            
        return await self.get_by_id(db, db_obj.id)

    async def update_availability(self, db: AsyncSession, db_obj: MenuItem, is_available: bool) -> MenuItem:
        db_obj.is_available = is_available
        await db.commit()
        await db.refresh(db_obj)
        return await self.get_by_id(db, db_obj.id)

    async def delete(self, db: AsyncSession, db_obj: MenuItem) -> None:
        await db.delete(db_obj)
        await db.commit()

menu_repo = MenuRepository()
