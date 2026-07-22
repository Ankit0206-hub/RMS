from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.reviews import Review, ItemReview
from app.schemas.reviews import ReviewCreate
from datetime import datetime

class ReviewService:
    async def create_review(self, db: AsyncSession, review_in: ReviewCreate) -> Review:
        # Create review
        new_review = Review(
            session_id=review_in.session_id,
            customer_name=review_in.customer_name,
            rating=review_in.rating,
            comment=review_in.comment
        )
        db.add(new_review)
        await db.flush() # To get review ID
        
        # Create item reviews
        for item_rev_in in review_in.item_reviews:
            new_item_rev = ItemReview(
                review_id=new_review.id,
                menu_item_id=item_rev_in.menu_item_id,
                rating=item_rev_in.rating,
                comment=item_rev_in.comment
            )
            db.add(new_item_rev)
            
        await db.commit()
        await db.refresh(new_review)
        
        # Need to load item_reviews relationship
        stmt = select(Review).options(selectinload(Review.item_reviews)).where(Review.id == new_review.id)
        result = await db.execute(stmt)
        return result.scalar_one()

    async def get_reviews(self, db: AsyncSession, page: int = 1, page_size: int = 20):
        offset = (page - 1) * page_size
        stmt = select(Review).options(selectinload(Review.item_reviews)).order_by(Review.created_at.desc()).offset(offset).limit(page_size)
        result = await db.execute(stmt)
        reviews = result.scalars().all()
        
        # Get total count
        from sqlalchemy import func
        total = await db.scalar(select(func.count(Review.id)))
        
        return reviews, total

