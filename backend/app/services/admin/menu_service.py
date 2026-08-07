from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.admin.menu import MenuItemCreate, MenuItemUpdate
from app.repositories.admin.menu_repository import menu_repo
from app.services.admin.categories_service import category_service
from app.models.menu import MenuItem
from app.core.exceptions import BusinessException
from app.websocket.connection_manager import manager
from datetime import datetime

class MenuService:
    async def get_kpis(self, db: AsyncSession) -> dict:
        return await menu_repo.get_kpis(db)

    async def get_all_items(self, db: AsyncSession, skip: int = 0, limit: int = 100, category_id: int = None) -> List[MenuItem]:
        return await menu_repo.get_all(db, skip=skip, limit=limit, category_id=category_id)

    async def get_item(self, db: AsyncSession, item_id: int) -> MenuItem:
        item = await menu_repo.get_by_id(db, item_id)
        if not item:
            raise BusinessException(detail="Menu item not found", status_code=404)
        return item

    async def create_item(self, db: AsyncSession, obj_in: MenuItemCreate) -> MenuItem:
        # Validate category exists
        await category_service.get_category(db, obj_in.category_id)
        
        existing = await menu_repo.get_by_code(db, obj_in.item_code)
        if existing:
            raise BusinessException(detail="Menu item code already exists", status_code=409)
            
        result = await menu_repo.create(db, obj_in)
        await manager.broadcast("menu.updated", {"timestamp": datetime.utcnow().isoformat()}, target_roles=["waiter", "customer", "admin", "display"])
        return result

    async def create_items_bulk(self, db: AsyncSession, objs_in: List[MenuItemCreate]) -> List[MenuItem]:
        if not objs_in:
            return []
            
        # Validate category exists (assuming all items have the same category, or check them all)
        categories = {obj.category_id for obj in objs_in}
        for cat_id in categories:
            await category_service.get_category(db, cat_id)
            
        # Check for duplicate item codes in payload
        codes_in_payload = [obj.item_code for obj in objs_in]
        if len(codes_in_payload) != len(set(codes_in_payload)):
            raise BusinessException(detail="Duplicate menu item codes in request payload", status_code=400)
            
        # Check against DB
        for code in codes_in_payload:
            existing = await menu_repo.get_by_code(db, code)
            if existing:
                raise BusinessException(detail=f"Menu item code '{code}' already exists in database", status_code=409)
                
        return await menu_repo.create_bulk(db, objs_in)

    async def update_item(self, db: AsyncSession, item_id: int, obj_in: MenuItemUpdate) -> MenuItem:
        item = await self.get_item(db, item_id)
        
        if obj_in.category_id:
            await category_service.get_category(db, obj_in.category_id)
            
        if obj_in.item_code and obj_in.item_code != item.item_code:
            existing = await menu_repo.get_by_code(db, obj_in.item_code)
            if existing:
                raise BusinessException(detail="Menu item code already exists", status_code=409)
                
        result = await menu_repo.update(db, item, obj_in)
        await manager.broadcast("menu.updated", {"timestamp": datetime.utcnow().isoformat()}, target_roles=["waiter", "customer", "admin", "display"])
        return result

    async def update_availability(self, db: AsyncSession, item_id: int, is_available: bool) -> MenuItem:
        item = await self.get_item(db, item_id)
        result = await menu_repo.update_availability(db, item, is_available)
        await manager.broadcast("menu.updated", {"timestamp": datetime.utcnow().isoformat()}, target_roles=["waiter", "customer", "admin", "display"])
        return result

    async def delete_item(self, db: AsyncSession, item_id: int) -> None:
        item = await self.get_item(db, item_id)
        await menu_repo.delete(db, item)
        await manager.broadcast("menu.updated", {"timestamp": datetime.utcnow().isoformat()}, target_roles=["waiter", "customer", "admin", "display"])

menu_service = MenuService()
