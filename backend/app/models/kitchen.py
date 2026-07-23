from typing import List, Optional
from sqlalchemy import BigInteger, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.models.mixins import TimestampMixin

class Kitchen(TimestampMixin, Base):
    __tablename__ = "kitchens"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships are handled via string references in the target models if needed,
    # or explicitly if we import them.
