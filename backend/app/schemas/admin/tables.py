from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TableBase(BaseModel):
    table_number: str
    name: Optional[str] = None
    floor: Optional[str] = None
    capacity: int
    status: Optional[str] = "Available"
    is_virtual: bool = False
    parent_table_id: Optional[int] = None

class TableCreate(TableBase):
    pass

class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    name: Optional[str] = None
    floor: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None

class TableResponse(TableBase):
    id: int
    created_at: datetime
    updated_at: datetime
    current_order_id: Optional[str] = None
    current_order_amount: Optional[str] = None
    assigned_waiter_id: Optional[int] = None
    assigned_waiter_name: Optional[str] = None

    class Config:
        from_attributes = True

class TableAssignmentCreate(BaseModel):
    employee_id: int

class TableAssignmentResponse(BaseModel):
    id: int
    employee_id: int
    table_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TableTransferCreate(BaseModel):
    target_table_id: int

class TableMergeCreate(BaseModel):
    table_ids: List[int]
