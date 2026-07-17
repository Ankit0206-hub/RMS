from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class WaiterTableResponse(BaseModel):
    id: str # Mapping table_number to id for frontend compatibility
    table_number: str
    capacity: int
    status: str
    time: str = ""
    guests: int = 0
    order: str = ""
    currentBill: float = 0.0

    model_config = ConfigDict(from_attributes=True)

class WaiterMenuItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    is_veg: bool = True
    is_available: bool = True
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class WaiterMenuCategory(BaseModel):
    id: int
    name: str
    items: List[WaiterMenuItem] = []

    model_config = ConfigDict(from_attributes=True)

class WaiterStartSessionRequest(BaseModel):
    guests: int
