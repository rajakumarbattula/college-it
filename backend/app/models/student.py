"""Student persistence model."""

import uuid
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.department import Department


class StudentStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"


class Student(TimestampMixin, Base):
    __tablename__ = "students"
    __table_args__ = (Index("ix_students_department_id_status", "department_id", "status"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    status: Mapped[StudentStatus] = mapped_column(
        Enum(
            StudentStatus,
            name="student_status",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
        server_default=StudentStatus.ACTIVE.value,
    )
    department_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False
    )

    department: Mapped["Department"] = relationship(back_populates="students")
