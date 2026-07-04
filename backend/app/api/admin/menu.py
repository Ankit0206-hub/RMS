from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.menu import MenuItemCreate, MenuItemUpdate, MenuItemResponse, MenuItemAvailabilityPatch
from app.schemas.common import StandardResponse, PaginationMeta
from app.services.admin.menu_service import menu_service
from app.models.security import Admin
from app.api.deps import get_current_admin_or_operator

router = APIRouter()

@router.get("/kpis", response_model=StandardResponse[dict])
async def get_menu_kpis(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await menu_service.get_kpis(db)
    return StandardResponse(data=data)

@router.get("/", response_model=StandardResponse[List[MenuItemResponse]])
async def get_menu_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
    category_id: int = Query(None, description="Filter by category ID"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    skip = (page - 1) * page_size
    data = await menu_service.get_all_items(db, skip=skip, limit=page_size, category_id=category_id)
    meta = PaginationMeta(total=len(data), page=page, page_size=page_size, pages=1)
    return StandardResponse(data=data, meta=meta)

@router.post("/", response_model=StandardResponse[MenuItemResponse], status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    obj_in: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await menu_service.create_item(db, obj_in)
    return StandardResponse(data=data)

@router.post("/bulk", response_model=StandardResponse[List[MenuItemResponse]], status_code=status.HTTP_201_CREATED)
async def create_menu_items_bulk(
    objs_in: List[MenuItemCreate],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await menu_service.create_items_bulk(db, objs_in)
    return StandardResponse(data=data)

@router.get("/{item_id}", response_model=StandardResponse[MenuItemResponse])
async def get_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await menu_service.get_item(db, item_id)
    return StandardResponse(data=data)

@router.put("/{item_id}", response_model=StandardResponse[MenuItemResponse])
async def update_menu_item(
    item_id: int,
    obj_in: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await menu_service.update_item(db, item_id, obj_in)
    return StandardResponse(data=data)

@router.patch("/{item_id}/availability", response_model=StandardResponse[MenuItemResponse])
async def update_availability(
    item_id: int,
    obj_in: MenuItemAvailabilityPatch,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await menu_service.update_availability(db, item_id, obj_in.is_available)
    return StandardResponse(data=data)

@router.delete("/{item_id}", response_model=StandardResponse[dict])
async def delete_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    await menu_service.delete_item(db, item_id)
    return StandardResponse(data={"deleted": True})
