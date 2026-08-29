"""Department persistence model."""

import uuid
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.faculty import Faculty
    from app.models.student import Student


class CourseCategory(StrEnum):
    VOCATIONAL = "VOCATIONAL"
    REGULAR = "REGULAR"


class Department(TimestampMixin, Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    category: Mapped[CourseCategory] = mapped_column(
        Enum(
            CourseCategory,
            name="course_category",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
        default=CourseCategory.REGULAR,
        server_default=CourseCategory.REGULAR.value,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    students: Mapped[list["Student"]] = relationship(back_populates="department")
    faculty_members: Mapped[list["Faculty"]] = relationship(back_populates="department")
