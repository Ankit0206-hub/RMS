from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.admin.categories import CategoryResponse

class VariantItemBase(BaseModel):
    name: str
    extra_price: float = 0.0
    is_default: bool = False

class VariantItemCreate(VariantItemBase):
    pass

class VariantItemResponse(VariantItemBase):
    id: int
    class Config:
        from_attributes = True

class VariantGroupBase(BaseModel):
    name: str

class VariantGroupCreate(VariantGroupBase):
    variants: List[VariantItemCreate] = []

class VariantGroupResponse(VariantGroupBase):
    id: int
    variants: List[VariantItemResponse] = []
    class Config:
        from_attributes = True

class AddonItemBase(BaseModel):
    name: str
    price: float = 0.0
    item_type: str = "veg"

class AddonItemCreate(AddonItemBase):
    pass

class AddonItemResponse(AddonItemBase):
    id: int
    class Config:
        from_attributes = True

class AddonGroupBase(BaseModel):
    name: str
    min_selections: int = 0
    max_selections: int = 10

class AddonGroupCreate(AddonGroupBase):
    addons: List[AddonItemCreate] = []

class AddonGroupResponse(AddonGroupBase):
    id: int
    addons: List[AddonItemResponse] = []
    class Config:
        from_attributes = True


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
    item_type: Optional[str] = "veg"
    is_spicy_customizable: Optional[bool] = None
    kitchen_id: Optional[int] = None
    image_url: Optional[str] = None

class MenuItemCreate(MenuItemBase):
    variant_groups: Optional[List[VariantGroupCreate]] = []
    addon_groups: Optional[List[AddonGroupCreate]] = []

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
    item_type: Optional[str] = None
    is_spicy_customizable: Optional[bool] = None
    kitchen_id: Optional[int] = None
    image_url: Optional[str] = None
    variant_groups: Optional[List[VariantGroupCreate]] = None
    addon_groups: Optional[List[AddonGroupCreate]] = None

class MenuItemResponse(MenuItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    variant_groups: List[VariantGroupResponse] = []
    addon_groups: List[AddonGroupResponse] = []

    class Config:
        from_attributes = True

class MenuItemAvailabilityPatch(BaseModel):
    is_available: bool
