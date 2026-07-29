from typing import List, Optional
from datetime import datetime
from sqlalchemy import BigInteger, String, ForeignKey, Boolean, Numeric, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class MenuCategory(TimestampMixin, Base):
    __tablename__ = "menu_categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_spicy_customizable: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    items: Mapped[List["MenuItem"]] = relationship(back_populates="category", cascade="all, delete-orphan")

class MenuItem(TimestampMixin, Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_categories.id", ondelete="RESTRICT"), index=True)
    kitchen_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("kitchens.id", ondelete="SET NULL"), index=True)
    item_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(150), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    half_price: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True)
    is_spicy_customizable: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    category: Mapped["MenuCategory"] = relationship(back_populates="items")
    images: Mapped[List["FoodImage"]] = relationship(back_populates="menu_item", cascade="all, delete-orphan")

class FoodImage(TimestampMixin, Base):
    __tablename__ = "food_images"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    menu_item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="CASCADE"), index=True)
    image_url: Mapped[str] = mapped_column(String(500))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    menu_item: Mapped["MenuItem"] = relationship(back_populates="images")

class MenuAvailabilityHistory(TimestampMixin, Base):
    __tablename__ = "menu_availability_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    menu_item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="CASCADE"), index=True)
    employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), index=True)
    status: Mapped[bool] = mapped_column(Boolean) # True = marked available, False = marked out of stock
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    reason: Mapped[Optional[str]] = mapped_column(String(255))
