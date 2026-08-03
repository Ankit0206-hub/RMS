from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    gender: Optional[str] = None
    is_active: Optional[bool] = True
    role_id: int
    kitchen_id: Optional[int] = None

class EmployeeCreate(EmployeeBase):
    password: str
    employee_code: Optional[str] = None

class EmployeeUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    employee_code: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None
    kitchen_id: Optional[int] = None
    password: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    employee_code: str
    created_at: datetime
    updated_at: datetime
    role_name: Optional[str] = None
    kitchen_id: Optional[int] = None

    class Config:
        from_attributes = True
