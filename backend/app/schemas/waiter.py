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

class WaiterVariantItem(BaseModel):
    id: int
    name: str
    extra_price: float = 0.0
    is_default: bool = False

    model_config = ConfigDict(from_attributes=True)

class WaiterVariantGroup(BaseModel):
    id: int
    name: str
    variants: List[WaiterVariantItem] = []

    model_config = ConfigDict(from_attributes=True)

class WaiterAddonItem(BaseModel):
    id: int
    name: str
    price: float = 0.0
    item_type: str = "veg"

    model_config = ConfigDict(from_attributes=True)

class WaiterAddonGroup(BaseModel):
    id: int
    name: str
    min_selections: int = 0
    max_selections: int = 10
    addons: List[WaiterAddonItem] = []

    model_config = ConfigDict(from_attributes=True)

class WaiterMenuItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    is_veg: bool = True
    is_available: bool = True
    image_url: Optional[str] = None
    half_price: Optional[float] = None
    is_spicy_customizable: Optional[bool] = None
    variant_groups: List[WaiterVariantGroup] = []
    addon_groups: List[WaiterAddonGroup] = []

    model_config = ConfigDict(from_attributes=True)

class WaiterMenuCategory(BaseModel):
    id: int
    name: str
    items: List[WaiterMenuItem] = []
    is_spicy_customizable: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class WaiterStartSessionRequest(BaseModel):
    guests: int
