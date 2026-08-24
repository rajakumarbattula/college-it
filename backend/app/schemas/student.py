"""Pydantic schemas for student API requests and responses."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.student import StudentStatus


class StudentAttributes(BaseModel):
    """Fields shared by student creation and full replacement requests."""

    model_config = ConfigDict(str_strip_whitespace=True)

    student_number: str = Field(min_length=1, max_length=30)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    status: StudentStatus = StudentStatus.ACTIVE
    department_id: UUID


class StudentCreate(StudentAttributes):
    """Payload for creating a student."""


class StudentUpdate(StudentAttributes):
    """Payload for fully replacing a student."""

    status: StudentStatus


class StudentResponse(StudentAttributes):
    """Student representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID


class StudentListResponse(BaseModel):
    """Paginated student listing."""

    items: list[StudentResponse]
    page: int
    page_size: int
    total: int
