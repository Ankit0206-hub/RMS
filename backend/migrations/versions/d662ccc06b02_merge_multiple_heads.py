"""merge multiple heads

Revision ID: d662ccc06b02
Revises: 47ca4e007e94, f12c67b051de
Create Date: 2026-07-14 11:43:45.315060

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd662ccc06b02'
down_revision: Union[str, Sequence[str], None] = ('47ca4e007e94', 'f12c67b051de')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
