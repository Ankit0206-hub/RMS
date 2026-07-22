from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_staff
from app.db.database import get_db
from app.schemas.common import StandardResponse, PaginationMeta
from app.schemas.reviews import ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Admin - Reviews"], dependencies=[Depends(get_current_staff)])
service = ReviewService()

@router.get("", response_model=StandardResponse[list[ReviewResponse]])
async def get_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    db: AsyncSession = Depends(get_db)
):
    reviews, total = await service.get_reviews(db, page, page_size)
    meta = PaginationMeta(total=total, page=page, page_size=page_size)
    return StandardResponse(success=True, message="Reviews retrieved successfully", data=reviews, meta=meta)
