from typing import List, Optional
from datetime import datetime
from sqlalchemy import BigInteger, String, ForeignKey, Boolean, Integer, Numeric, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class CustomerSession(TimestampMixin, Base):
    __tablename__ = "customer_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    table_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("restaurant_tables.id", ondelete="RESTRICT"), index=True)
    customer_name: Mapped[Optional[str]] = mapped_column(String(100))
    customer_phone: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    number_of_people: Mapped[Optional[int]] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="Active", index=True) # Active, Completed
    bill_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    
    table: Mapped["RestaurantTable"] = relationship(back_populates="sessions")
    orders: Mapped[List["Order"]] = relationship(back_populates="session")
    bills: Mapped[List["Bill"]] = relationship(back_populates="session")

    @property
    def table_name(self) -> Optional[str]:
        if self.table:
            return self.table.name if self.table.name else self.table.table_number
        return None

class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("customer_sessions.id", ondelete="RESTRICT"), index=True)
    waiter_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), index=True)
    order_type: Mapped[str] = mapped_column(String(50), default="Dine-in", index=True) # Dine-in, Takeaway, Delivery
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True) # Pending, Confirmed, Cooked, Served, Completed, Cancelled
    special_instructions: Mapped[Optional[str]] = mapped_column(Text)
    
    session: Mapped["CustomerSession"] = relationship(back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    status_history: Mapped[List["OrderStatusHistory"]] = relationship(back_populates="order", cascade="all, delete-orphan")

class OrderItem(TimestampMixin, Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    menu_item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="RESTRICT"), index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    price_at_order: Mapped[float] = mapped_column(Numeric(10, 2))
    notes: Mapped[Optional[str]] = mapped_column(String(255))

    order: Mapped["Order"] = relationship(back_populates="items")
    menu_item: Mapped["MenuItem"] = relationship("MenuItem")

class OrderStatusHistory(TimestampMixin, Base):
    __tablename__ = "order_status_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20), index=True)
    changed_by_employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), index=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    order: Mapped["Order"] = relationship(back_populates="status_history")
