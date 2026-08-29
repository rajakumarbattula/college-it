"""Add public student registration fields and role.

Revision ID: 20260829_0003
Revises: 20260824_0002
Create Date: 2026-08-29 00:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260829_0003"
down_revision: str | None = "20260824_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("full_name", sa.String(length=200), nullable=True))
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'student'")


def downgrade() -> None:
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TYPE user_role RENAME TO user_role_current")
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'staff')")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE user_role "
        "USING CASE WHEN role::text = 'student' THEN 'staff' ELSE role::text END::user_role"
    )
    op.execute("DROP TYPE user_role_current")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'admin'")
    op.drop_column("users", "full_name")
