from typing import List, Optional
from datetime import datetime
from sqlalchemy import BigInteger, String, ForeignKey, Boolean, Integer, Numeric, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class Bill(TimestampMixin, Base):
    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("customer_sessions.id", ondelete="RESTRICT"), index=True)
    bill_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    generated_by_employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), index=True)
    
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2))
    total_tax: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    total_discount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    service_charge: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    grand_total: Mapped[float] = mapped_column(Numeric(12, 2))
    
    payment_status: Mapped[str] = mapped_column(String(20), default="Pending", index=True) # Pending, Paid, Failed, Refunded

    items: Mapped[List["BillItem"]] = relationship(back_populates="bill", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship(back_populates="bill", cascade="all, delete-orphan")
    session: Mapped["CustomerSession"] = relationship(back_populates="bills")

class BillItem(TimestampMixin, Base):
    __tablename__ = "bill_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    bill_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("bills.id", ondelete="CASCADE"), index=True)
    menu_item_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="SET NULL"), index=True)
    item_name: Mapped[str] = mapped_column(String(150))
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    total: Mapped[float] = mapped_column(Numeric(10, 2))

    bill: Mapped["Bill"] = relationship(back_populates="items")

class Payment(TimestampMixin, Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    bill_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("bills.id", ondelete="RESTRICT"), index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    payment_method: Mapped[str] = mapped_column(String(50)) # Cash, Card, UPI, etc.
    transaction_id: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(20), default="Pending")

    bill: Mapped["Bill"] = relationship(back_populates="payments")

class Discount(TimestampMixin, Base):
    __tablename__ = "discounts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(String(255))
    discount_type: Mapped[str] = mapped_column(String(20)) # Percentage, Fixed
    value: Mapped[float] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class TaxConfiguration(TimestampMixin, Base):
    __tablename__ = "tax_configuration"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50)) # e.g., GST
    rate: Mapped[float] = mapped_column(Numeric(5, 2)) # Percentage
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
