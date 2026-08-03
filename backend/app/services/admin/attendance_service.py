from typing import List
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.security import EmployeeAttendance
from app.schemas.admin.attendance import AttendanceCreate
from app.repositories.admin.attendance_repository import attendance_repo

class AttendanceService:
    async def get_attendance_by_date(self, db: AsyncSession, target_date: date) -> List[EmployeeAttendance]:
        return await attendance_repo.get_by_date(db, target_date)
        
    async def upsert_attendance(self, db: AsyncSession, attendance_in: AttendanceCreate) -> EmployeeAttendance:
        return await attendance_repo.upsert(db, attendance_in)

attendance_service = AttendanceService()
