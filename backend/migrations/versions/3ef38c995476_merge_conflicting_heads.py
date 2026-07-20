"""merge conflicting heads

Revision ID: 3ef38c995476
Revises: 7678dec6966c, d14e77f8fa4b
Create Date: 2026-07-20 17:26:25.849991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ef38c995476'
down_revision: Union[str, Sequence[str], None] = ('7678dec6966c', 'd14e77f8fa4b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
