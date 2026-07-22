from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas.common import StandardResponse
from app.schemas.reviews import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Customer - Reviews"])
service = ReviewService()

@router.post("", response_model=StandardResponse[ReviewResponse])
async def submit_review(review_in: ReviewCreate, db: AsyncSession = Depends(get_db)):
    review = await service.create_review(db, review_in)
    return StandardResponse(success=True, message="Review submitted successfully", data=review)
