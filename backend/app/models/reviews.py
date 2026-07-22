from typing import List, Optional
from sqlalchemy import BigInteger, String, ForeignKey, Integer, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class Review(TimestampMixin, Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("customer_sessions.id", ondelete="CASCADE"), index=True)
    customer_name: Mapped[Optional[str]] = mapped_column(String(100))
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    comment: Mapped[Optional[str]] = mapped_column(Text)

    session: Mapped["CustomerSession"] = relationship("CustomerSession")
    item_reviews: Mapped[List["ItemReview"]] = relationship("ItemReview", back_populates="review", cascade="all, delete-orphan")

class ItemReview(TimestampMixin, Base):
    __tablename__ = "item_reviews"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    review_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("reviews.id", ondelete="CASCADE"), index=True)
    menu_item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="CASCADE"), index=True)
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    comment: Mapped[Optional[str]] = mapped_column(Text)

    review: Mapped["Review"] = relationship("Review", back_populates="item_reviews")
    menu_item: Mapped["MenuItem"] = relationship("MenuItem")
