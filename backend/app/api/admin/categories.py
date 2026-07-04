from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.categories import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.common import StandardResponse, PaginationMeta
from app.services.admin.categories_service import category_service
from app.models.security import Admin
from app.api.deps import get_current_admin_or_operator

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[CategoryResponse]])
async def get_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    skip = (page - 1) * page_size
    data = await category_service.get_all_categories(db, skip=skip, limit=page_size)
    meta = PaginationMeta(total=len(data), page=page, page_size=page_size, pages=1)
    return StandardResponse(data=data, meta=meta)

@router.post("/", response_model=StandardResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
async def create_category(
    obj_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await category_service.create_category(db, obj_in)
    return StandardResponse(data=data)

@router.get("/{category_id}", response_model=StandardResponse[CategoryResponse])
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await category_service.get_category(db, category_id)
    return StandardResponse(data=data)

@router.put("/{category_id}", response_model=StandardResponse[CategoryResponse])
async def update_category(
    category_id: int,
    obj_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await category_service.update_category(db, category_id, obj_in)
    return StandardResponse(data=data)

@router.delete("/{category_id}", response_model=StandardResponse[dict])
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    await category_service.delete_category(db, category_id)
    return StandardResponse(data={"deleted": True})
