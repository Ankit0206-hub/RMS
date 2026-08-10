from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.roles import RoleCreate, RoleUpdate, RoleResponse
from app.schemas.common import StandardResponse, PaginationMeta
from app.services.admin.role_service import role_service
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[RoleResponse]])
async def get_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    skip = (page - 1) * page_size
    data = await role_service.get_all_roles(db, skip=skip, limit=page_size)
    meta = PaginationMeta(total=len(data), page=page, page_size=page_size, pages=1)
    return StandardResponse(data=data, meta=meta)

@router.post("/", response_model=StandardResponse[RoleResponse], status_code=status.HTTP_201_CREATED)
async def create_role(
    obj_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    data = await role_service.create_role(db, obj_in)
    return StandardResponse(data=data)

@router.get("/{role_id}", response_model=StandardResponse[RoleResponse])
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    data = await role_service.get_role(db, role_id)
    return StandardResponse(data=data)

@router.put("/{role_id}", response_model=StandardResponse[RoleResponse])
async def update_role(
    role_id: int,
    obj_in: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    data = await role_service.update_role(db, role_id, obj_in)
    return StandardResponse(data=data)

@router.delete("/{role_id}", response_model=StandardResponse[dict])
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    await role_service.delete_role(db, role_id)
    return StandardResponse(data={"deleted": True})
