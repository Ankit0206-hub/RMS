from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.tables import TableCreate, TableUpdate, TableResponse
from app.schemas.common import StandardResponse, PaginationMeta
from app.services.admin.tables_service import tables_service
from app.models.security import Admin
from app.api.deps import get_current_admin_or_operator

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[TableResponse]])
async def get_tables(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    skip = (page - 1) * page_size
    data = await tables_service.get_all_tables(db, skip=skip, limit=page_size)
    meta = PaginationMeta(total=len(data), page=page, page_size=page_size, pages=1)
    return StandardResponse(data=data, meta=meta)

@router.post("/", response_model=StandardResponse[TableResponse], status_code=status.HTTP_201_CREATED)
async def create_table(
    obj_in: TableCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await tables_service.create_table(db, obj_in)
    return StandardResponse(data=data)

@router.get("/{table_id}", response_model=StandardResponse[TableResponse])
async def get_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await tables_service.get_table(db, table_id)
    return StandardResponse(data=data)

@router.put("/{table_id}", response_model=StandardResponse[TableResponse])
async def update_table(
    table_id: int,
    obj_in: TableUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await tables_service.update_table(db, table_id, obj_in)
    return StandardResponse(data=data)

@router.delete("/{table_id}", response_model=StandardResponse[dict])
async def delete_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    await tables_service.delete_table(db, table_id)
    return StandardResponse(data={"deleted": True})

from app.schemas.admin.tables import TableAssignmentCreate, TableAssignmentResponse, TableTransferCreate, TableMergeCreate

@router.post("/merge", response_model=StandardResponse[TableResponse])
async def merge_tables(
    obj_in: TableMergeCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await tables_service.merge_tables(db, obj_in.table_ids)
    return StandardResponse(data=data, message="Tables merged successfully")

@router.post("/{table_id}/assign", response_model=StandardResponse[TableAssignmentResponse])
async def assign_waiter(
    table_id: int,
    obj_in: TableAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await tables_service.assign_waiter(db, table_id, obj_in.employee_id)
    return StandardResponse(data=data, message="Waiter assigned to table")

@router.delete("/assignments/clear-all", response_model=StandardResponse[dict])
async def clear_all_assignments(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    await tables_service.clear_all_assignments(db)
    return StandardResponse(data={"deleted": True}, message="All table assignments cleared")

@router.delete("/{table_id}/assign", response_model=StandardResponse[dict])
async def unassign_waiter(
    table_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    await tables_service.unassign_waiter(db, table_id)
    return StandardResponse(data={"deleted": True}, message="Waiter unassigned from table")

@router.post("/{table_id}/transfer", response_model=StandardResponse[dict])
async def transfer_table(
    table_id: int,
    obj_in: TableTransferCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    await tables_service.transfer_table(db, table_id, obj_in.target_table_id)
    return StandardResponse(data={"success": True}, message="Table transferred successfully")
