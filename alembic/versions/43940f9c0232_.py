"""empty message

Revision ID: 43940f9c0232
Revises: a318666213ce
Create Date: 2025-12-25 16:31:08.998782

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '43940f9c0232'
down_revision: Union[str, Sequence[str], None] = 'a318666213ce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
