"""Student achievement persistence model."""

import uuid
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.student import Student


class AchievementCategory(StrEnum):
    ACADEMIC = "ACADEMIC"
    SPORTS = "SPORTS"
    CULTURAL = "CULTURAL"
    OTHER = "OTHER"


class StudentAchievement(TimestampMixin, Base):
    __tablename__ = "student_achievements"
    __table_args__ = (Index("ix_achievements_featured_date", "featured", "achievement_date"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("students.id", ondelete="SET NULL"), nullable=True
    )
    student_display_name: Mapped[str] = mapped_column(String(201), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[AchievementCategory] = mapped_column(
        Enum(
            AchievementCategory,
            name="achievement_category",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
    )
    achievement_date: Mapped[Date] = mapped_column(Date, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    student: Mapped["Student | None"] = relationship(back_populates="achievements")
