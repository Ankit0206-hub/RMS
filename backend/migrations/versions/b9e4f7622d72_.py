"""empty message

Revision ID: b9e4f7622d72
Revises: 209895a48a49, 882322069138
Create Date: 2026-07-23 12:35:24.186422

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9e4f7622d72'
down_revision: Union[str, Sequence[str], None] = ('209895a48a49', '882322069138')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
