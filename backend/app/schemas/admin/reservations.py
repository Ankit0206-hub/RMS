from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReservationBase(BaseModel):
    customer_name: str
    contact_number: Optional[str] = None
    reservation_time: datetime
    party_size: int
    status: Optional[str] = "Pending"
    table_id: Optional[int] = None

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    customer_name: Optional[str] = None
    contact_number: Optional[str] = None
    reservation_time: Optional[datetime] = None
    party_size: Optional[int] = None
    status: Optional[str] = None
    table_id: Optional[int] = None

class ReservationResponse(ReservationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    table_number: Optional[str] = None

    class Config:
        from_attributes = True
