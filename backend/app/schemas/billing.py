from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class BillItemBase(BaseModel):
    menu_item_id: Optional[int]
    item_name: str
    quantity: int
    price: float
    total: float

class BillItemResponse(BillItemBase):
    id: int
    bill_id: int
    model_config = ConfigDict(from_attributes=True)

class PaymentBase(BaseModel):
    amount: float
    payment_method: str
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    bill_id: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BillBase(BaseModel):
    session_id: int
    subtotal: float
    total_tax: float
    total_discount: float
    service_charge: float
    grand_total: float

class BillCreate(BaseModel):
    session_id: int
    # Typically, bills are generated automatically based on orders in the session.
    # The actual calculation will happen in the service.

class BillSessionResponse(BaseModel):
    id: int
    customer_name: Optional[str]
    customer_phone: Optional[str]
    table_name: Optional[str] = None
    number_of_people: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class BillResponse(BillBase):
    id: int
    bill_number: str
    generated_at: datetime
    generated_by_employee_id: Optional[int]
    payment_status: str
    items: List[BillItemResponse] = []
    payments: List[PaymentResponse] = []
    session: Optional[BillSessionResponse] = None
    model_config = ConfigDict(from_attributes=True)
