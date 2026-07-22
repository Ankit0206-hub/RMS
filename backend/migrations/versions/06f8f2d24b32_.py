"""empty message

Revision ID: 06f8f2d24b32
Revises: 9b937c0e4ef7, b0bd1d40b022
Create Date: 2026-07-22 09:42:15.949262

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '06f8f2d24b32'
down_revision: Union[str, Sequence[str], None] = ('9b937c0e4ef7', 'b0bd1d40b022')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
