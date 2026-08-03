from typing import List, Optional
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.security import EmployeeAttendance
from app.schemas.admin.attendance import AttendanceCreate

class AttendanceRepository:
    async def get_by_date(self, db: AsyncSession, target_date: date) -> List[EmployeeAttendance]:
        query = select(EmployeeAttendance).where(EmployeeAttendance.date == target_date)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_employee_and_date(self, db: AsyncSession, employee_id: int, target_date: date) -> Optional[EmployeeAttendance]:
        query = select(EmployeeAttendance).where(
            EmployeeAttendance.employee_id == employee_id,
            EmployeeAttendance.date == target_date
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def upsert(self, db: AsyncSession, attendance_in: AttendanceCreate) -> EmployeeAttendance:
        existing = await self.get_by_employee_and_date(db, attendance_in.employee_id, attendance_in.date)
        if existing:
            existing.status = attendance_in.status
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            db_obj = EmployeeAttendance(
                employee_id=attendance_in.employee_id,
                date=attendance_in.date,
                status=attendance_in.status
            )
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj

attendance_repo = AttendanceRepository()
