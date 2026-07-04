from typing import List, Optional
from datetime import datetime
from sqlalchemy import BigInteger, String, ForeignKey, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class Notification(TimestampMixin, Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[Text] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    # Type: e.g., OrderUpdate, SystemAlert
    notification_type: Mapped[str] = mapped_column(String(50))

class ActivityLog(TimestampMixin, Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), index=True)
    admin_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("admins.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(100), index=True)
    module: Mapped[str] = mapped_column(String(50), index=True)
    details: Mapped[Optional[str]] = mapped_column(Text)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50))

class ReportExport(TimestampMixin, Base):
    __tablename__ = "report_exports"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    requested_by_employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="SET NULL"), index=True)
    requested_by_admin_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("admins.id", ondelete="SET NULL"), index=True)
    report_type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="Pending") # Pending, Processing, Completed, Failed
    file_url: Mapped[Optional[str]] = mapped_column(String(500))
    generated_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

class SystemSetting(TimestampMixin, Base):
    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(String(255))
