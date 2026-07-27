from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.admin.categories import CategoryResponse

class MenuItemBase(BaseModel):
    category_id: int
    item_code: str
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    half_price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = True
    is_available: Optional[bool] = True
    is_veg: Optional[bool] = True
    kitchen_id: Optional[int] = None

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    item_code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    half_price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None
    is_available: Optional[bool] = None
    is_veg: Optional[bool] = None
    kitchen_id: Optional[int] = None

class MenuItemResponse(MenuItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

class MenuItemAvailabilityPatch(BaseModel):
    is_available: bool
