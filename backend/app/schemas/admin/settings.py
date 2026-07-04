from pydantic import BaseModel, Field
from typing import Optional

class RestaurantSettingsUpdate(BaseModel):
    restaurant_name: str
    logo_url: Optional[str] = None
    address: str
    contact_email: str
    contact_phone: str
    currency: str
    gst_percentage: float = Field(..., ge=0, le=100)
    service_charge_percentage: float = Field(..., ge=0, le=100)
    business_hours: str

class RestaurantSettingsResponse(RestaurantSettingsUpdate):
    pass
