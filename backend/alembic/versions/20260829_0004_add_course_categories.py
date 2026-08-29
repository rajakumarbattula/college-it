"""Add course category and active status to departments.

Revision ID: 20260829_0004
Revises: 20260829_0003
Create Date: 2026-08-29 00:00:00
"""

from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import uuid4

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260829_0004"
down_revision: str | None = "20260829_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

course_category = postgresql.ENUM("VOCATIONAL", "REGULAR", name="course_category", create_type=False)


def upgrade() -> None:
    course_category.create(op.get_bind(), checkfirst=True)
    op.add_column("departments", sa.Column("category", course_category, nullable=True))
    op.add_column(
        "departments", sa.Column("active", sa.Boolean(), server_default="true", nullable=False)
    )
    op.execute(
        "UPDATE departments SET category = CASE "
        "WHEN upper(code) IN ('CS', 'EE') THEN 'VOCATIONAL'::course_category "
        "ELSE 'REGULAR'::course_category END WHERE category IS NULL"
    )
    op.alter_column("departments", "category", nullable=False)
    for code, name, category in (
        ("CS", "Computer Science", "VOCATIONAL"),
        ("EE", "Electronics and Electrical", "VOCATIONAL"),
        ("MPC", "M.P.C", "REGULAR"),
        ("BIPC", "Bi.P.C", "REGULAR"),
    ):
        op.execute(
            sa.text(
                "INSERT INTO departments (id, code, name, category, active, created_at, updated_at) "
                "VALUES (:id, :code, :name, CAST(:category AS course_category), true, :created_at, :updated_at) "
                "ON CONFLICT (code) DO NOTHING"
            ).bindparams(
                id=uuid4(),
                code=code,
                name=name,
                category=category,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
        )


def downgrade() -> None:
    op.drop_column("departments", "active")
    op.drop_column("departments", "category")
    course_category.drop(op.get_bind(), checkfirst=True)
