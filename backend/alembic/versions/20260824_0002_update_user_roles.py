"""Update user roles for application authorization.

Revision ID: 20260824_0002
Revises: 20260824_0001
Create Date: 2026-08-24 00:00:00
"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260824_0002"
down_revision: str | None = "20260824_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TYPE user_role RENAME TO user_role_legacy")
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'faculty', 'staff')")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE user_role "
        "USING CASE WHEN role::text = 'viewer' THEN 'staff' ELSE role::text END::user_role"
    )
    op.execute("DROP TYPE user_role_legacy")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'admin'")


def downgrade() -> None:
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TYPE user_role RENAME TO user_role_current")
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'staff', 'viewer')")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE user_role "
        "USING CASE WHEN role::text = 'faculty' THEN 'staff' ELSE role::text END::user_role"
    )
    op.execute("DROP TYPE user_role_current")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'admin'")
