from typing import List
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.admin.attendance import AttendanceCreate, AttendanceResponse
from app.schemas.common import StandardResponse
from app.services.admin.attendance_service import attendance_service
from app.api.deps import get_current_admin_or_operator

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[AttendanceResponse]])
async def get_attendance(
    target_date: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await attendance_service.get_attendance_by_date(db, target_date)
    return StandardResponse(data=data)

@router.post("/", response_model=StandardResponse[AttendanceResponse])
async def upsert_attendance(
    attendance_in: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_admin_or_operator)
):
    data = await attendance_service.upsert_attendance(db, attendance_in)
    return StandardResponse(data=data, message="Attendance updated successfully")
