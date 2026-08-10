from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int
    notes: Optional[str] = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    price_at_order: float
    menu_item_name: Optional[str] = None
    menu_item_category: Optional[str] = None
    menu_item_image: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class OrderBase(BaseModel):
    session_id: int
    special_instructions: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status: str

class OrderResponse(OrderBase):
    id: int
    waiter_id: Optional[int]
    waiter_name: Optional[str] = None
    status: str
    items: List[OrderItemResponse]
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    table_number: Optional[str] = None
    order_type: Optional[str] = None
    total_amount: Optional[float] = 0.0
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CustomerSessionBase(BaseModel):
    table_id: int
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    number_of_people: Optional[int] = None

class CustomerSessionCreate(CustomerSessionBase):
    pass

class CustomerSessionResponse(CustomerSessionBase):
    id: int
    status: str
    bill_requested: bool = False
    table_name: Optional[str] = None
    orders: List[OrderResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
