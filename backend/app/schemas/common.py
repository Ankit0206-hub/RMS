from typing import TypeVar, Generic, Optional, Any, List
from pydantic import BaseModel, model_validator

T = TypeVar("T")

class PaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int = 1

    @model_validator(mode='after')
    def calculate_pages(self) -> 'PaginationMeta':
        if self.page_size > 0:
            self.pages = max((self.total + self.page_size - 1) // self.page_size, 1)
        return self

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    meta: Optional[PaginationMeta] = None
