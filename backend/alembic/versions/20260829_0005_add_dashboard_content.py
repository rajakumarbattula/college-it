"""Add dashboard content models.

Revision ID: 20260829_0005
Revises: 20260829_0004
Create Date: 2026-08-29 00:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260829_0005"
down_revision: str | None = "20260829_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

achievement_category = postgresql.ENUM("ACADEMIC", "SPORTS", "CULTURAL", "OTHER", name="achievement_category", create_type=False)
event_type = postgresql.ENUM("ACADEMIC", "CULTURAL", "SPORTS", "OTHER", name="event_type", create_type=False)
notification_priority = postgresql.ENUM("LOW", "NORMAL", "HIGH", "URGENT", name="notification_priority", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    achievement_category.create(bind, checkfirst=True)
    event_type.create(bind, checkfirst=True)
    notification_priority.create(bind, checkfirst=True)
    op.create_table(
        "events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("event_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("location", sa.String(length=200), nullable=False),
        sa.Column("event_type", event_type, nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column("featured", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_events")),
    )
    op.create_index("ix_events_event_date", "events", ["event_date"])
    op.create_table(
        "student_achievements",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("student_id", sa.Uuid(), nullable=True),
        sa.Column("student_display_name", sa.String(length=201), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", achievement_category, nullable=False),
        sa.Column("achievement_date", sa.Date(), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column("featured", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["students.id"], ondelete="SET NULL", name=op.f("fk_student_achievements_student_id_students")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_student_achievements")),
    )
    op.create_index("ix_achievements_featured_date", "student_achievements", ["featured", "achievement_date"])
    op.create_table(
        "notifications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("priority", notification_priority, server_default="NORMAL", nullable=False),
        sa.Column("active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notifications")),
    )
    op.create_index("ix_notifications_active_dates", "notifications", ["active", "published_at", "expires_at"])
    op.create_table(
        "gallery_photos",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("event_id", sa.Uuid(), nullable=True),
        sa.Column("caption", sa.String(length=300), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("featured", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="SET NULL", name=op.f("fk_gallery_photos_event_id_events")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_gallery_photos")),
    )
    op.create_index("ix_gallery_featured_order", "gallery_photos", ["featured", "display_order"])


def downgrade() -> None:
    op.drop_index("ix_gallery_featured_order", table_name="gallery_photos")
    op.drop_table("gallery_photos")
    op.drop_index("ix_notifications_active_dates", table_name="notifications")
    op.drop_table("notifications")
    op.drop_index("ix_achievements_featured_date", table_name="student_achievements")
    op.drop_table("student_achievements")
    op.drop_index("ix_events_event_date", table_name="events")
    op.drop_table("events")
    bind = op.get_bind()
    notification_priority.drop(bind, checkfirst=True)
    event_type.drop(bind, checkfirst=True)
    achievement_category.drop(bind, checkfirst=True)
