"""Pydantic schemas for faculty API requests and responses."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class FacultyAttributes(BaseModel):
    """Fields shared by faculty creation and full replacement requests."""

    model_config = ConfigDict(str_strip_whitespace=True)

    employee_number: str = Field(min_length=1, max_length=30)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    designation: str = Field(min_length=1, max_length=100)
    department_id: UUID


class FacultyCreate(FacultyAttributes):
    """Payload for creating a faculty member."""


class FacultyUpdate(FacultyAttributes):
    """Payload for fully replacing a faculty member."""


class FacultyResponse(FacultyAttributes):
    """Faculty representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID


class FacultyListResponse(BaseModel):
    """Paginated faculty listing."""

    items: list[FacultyResponse]
    page: int
    page_size: int
    total: int
