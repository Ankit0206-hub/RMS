from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class ItemReviewBase(BaseModel):
    menu_item_id: int
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None

class ItemReviewCreate(ItemReviewBase):
    pass

class ItemReviewResponse(ItemReviewBase):
    id: int
    review_id: int
    created_at: datetime
    updated_at: datetime
    menu_item_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ReviewBase(BaseModel):
    session_id: int
    customer_name: Optional[str] = None
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    item_reviews: List[ItemReviewCreate] = []

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime
    updated_at: datetime
    item_reviews: List[ItemReviewResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
