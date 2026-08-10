from pydantic import BaseModel, Field
from typing import Optional, List

class HolidayItem(BaseModel):
    date: str
    reason: str

class RestaurantSettingsUpdate(BaseModel):
    restaurant_name: str
    logo_url: Optional[str] = None
    address: str
    contact_email: str
    contact_phone: str
    currency: str
    gst_percentage: Optional[float] = 0
    cgst_percentage: float = Field(0, ge=0, le=100)
    sgst_percentage: float = Field(0, ge=0, le=100)
    service_charge_percentage: float = Field(..., ge=0, le=100)
    business_hours: str
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_closed_early: Optional[bool] = False
    holidays: Optional[List[HolidayItem]] = []
    merged_table_initial: Optional[str] = "M-"
    normal_table_prefix: Optional[str] = "T-"
    table_naming_convention: Optional[str] = "Numeric"
    total_tables: Optional[int] = 0
    floors_or_areas: Optional[List[str]] = []
    floor_prefixes: Optional[dict] = {}

class RestaurantSettingsResponse(RestaurantSettingsUpdate):
    pass
