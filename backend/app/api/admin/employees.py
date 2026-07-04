from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.employees import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.schemas.common import StandardResponse, PaginationMeta
from typing import Any
from app.services.admin.employee_service import employee_service
from app.models.security import Admin
from app.api.deps import get_current_admin, get_current_admin_or_operator

router = APIRouter()

@router.post("/", response_model=StandardResponse[EmployeeResponse])
async def create_employee(
    employee_in: EmployeeCreate, 
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    data = await employee_service.create_employee(db, employee_in)
    return StandardResponse(data=data)
    
@router.get("/kpis", response_model=StandardResponse[Any])
async def get_employee_kpis(
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    data = await employee_service.get_employee_kpis(db)
    return StandardResponse(data=data)

@router.get("/", response_model=StandardResponse[List[EmployeeResponse]])
async def read_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    skip = (page - 1) * page_size
    data = await employee_service.get_all_employees(db, skip=skip, limit=page_size)
    
    # Normally we would query total count, using a dummy for now to satisfy schema
    meta = PaginationMeta(total=len(data), page=page, page_size=page_size, pages=1)
    
    return StandardResponse(data=data, meta=meta)

@router.get("/{employee_id}", response_model=StandardResponse[EmployeeResponse])
async def read_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    data = await employee_service.get_employee(db, employee_id)
    return StandardResponse(data=data)

@router.put("/{employee_id}", response_model=StandardResponse[EmployeeResponse])
async def update_employee(
    employee_id: int,
    employee_in: EmployeeUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    data = await employee_service.update_employee(db, employee_id, employee_in)
    return StandardResponse(data=data)

@router.delete("/{employee_id}", response_model=StandardResponse[bool])
async def delete_employee(
    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    success = await employee_service.delete_employee(db, employee_id)
    return StandardResponse(data=success, message="Employee deleted successfully")
