from pydantic import BaseModel
from datetime import date
from typing import Optional

class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    
    class Config:
        from_attributes = True
