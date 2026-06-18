"""Add PostgreSQL trigram indexes for course search

Revision ID: e8b3c9d2f1a4
Revises: d6ec766b3e6b
Create Date: 2026-06-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "e8b3c9d2f1a4"
down_revision: Union[str, Sequence[str], None] = "d6ec766b3e6b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_courses_title_trgm
        ON courses
        USING gin (lower(coalesce(title, '')) gin_trgm_ops)
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_courses_description_trgm
        ON courses
        USING gin (lower(coalesce(description, '')) gin_trgm_ops)
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS ix_courses_description_trgm")
    op.execute("DROP INDEX IF EXISTS ix_courses_title_trgm")
