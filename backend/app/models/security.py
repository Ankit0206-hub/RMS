from typing import List, Optional
from datetime import datetime
from sqlalchemy import BigInteger, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class Role(TimestampMixin, Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    permissions: Mapped[List["Permission"]] = relationship(secondary="role_permissions", back_populates="roles")
    employees: Mapped[List["Employee"]] = relationship(back_populates="role")

class Permission(TimestampMixin, Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    roles: Mapped[List["Role"]] = relationship(secondary="role_permissions", back_populates="permissions")

class RolePermission(TimestampMixin, Base):
    __tablename__ = "role_permissions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    role_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    permission_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("permissions.id", ondelete="CASCADE"), index=True)

class Admin(TimestampMixin, Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Employee(TimestampMixin, Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    role_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("roles.id", ondelete="RESTRICT"))
    kitchen_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("kitchens.id", ondelete="SET NULL"), index=True)
    
    role: Mapped["Role"] = relationship(back_populates="employees")
    # Backpopulates for other relationships to be added later
    
    @property
    def role_name(self) -> str:
        return self.role.name if self.role else ""

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

class LoginHistory(TimestampMixin, Base):
    __tablename__ = "login_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    admin_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("admins.id", ondelete="CASCADE"), index=True)
    ip_address: Mapped[str] = mapped_column(String(50))
    user_agent: Mapped[Optional[str]] = mapped_column(String(255))
    login_time: Mapped[datetime] = mapped_column(DateTime, index=True)
