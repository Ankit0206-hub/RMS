from typing import List, Optional
from sqlalchemy import BigInteger, String, ForeignKey, Boolean, Integer, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class RestaurantSetting(TimestampMixin, Base):
    __tablename__ = "restaurant_settings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    setting_key: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    setting_value: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(String(255))

class RestaurantTable(TimestampMixin, Base):
    __tablename__ = "restaurant_tables"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    table_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(String(50))
    floor: Mapped[Optional[str]] = mapped_column(String(50))
    capacity: Mapped[int] = mapped_column(Integer)
    # Status: Available, Occupied, Reserved, Cleaning
    status: Mapped[str] = mapped_column(String(20), default="Available", index=True)
    
    assignments: Mapped[List["TableAssignment"]] = relationship(back_populates="table")
    reservations: Mapped[List["TableReservation"]] = relationship(back_populates="table")
    sessions: Mapped[List["CustomerSession"]] = relationship(back_populates="table")

class TableAssignment(TimestampMixin, Base):
    __tablename__ = "table_assignments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    table_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("restaurant_tables.id", ondelete="CASCADE"), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    table: Mapped["RestaurantTable"] = relationship(back_populates="assignments")

class TableReservation(TimestampMixin, Base):
    __tablename__ = "table_reservations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    contact_number: Mapped[Optional[str]] = mapped_column(String(20))
    reservation_time: Mapped[DateTime] = mapped_column(DateTime, index=True)
    party_size: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="Pending", index=True) # Pending, Confirmed, Cancelled, Completed
    table_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("restaurant_tables.id", ondelete="SET NULL"), index=True)

    table: Mapped[Optional["RestaurantTable"]] = relationship(back_populates="reservations")
