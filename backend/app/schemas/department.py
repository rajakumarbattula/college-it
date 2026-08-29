"""Pydantic schemas for department API requests and responses."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.department import CourseCategory


class DepartmentAttributes(BaseModel):
    """Fields shared by department write requests."""

    model_config = ConfigDict(str_strip_whitespace=True)

    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=2_000)


class DepartmentCreate(DepartmentAttributes):
    """Payload for creating a department."""

    category: CourseCategory
    active: bool = True


class DepartmentUpdate(DepartmentAttributes):
    """Payload for fully replacing a department."""

    category: CourseCategory
    active: bool


class DepartmentResponse(DepartmentAttributes):
    """Department representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category: CourseCategory
    active: bool


class DepartmentListResponse(BaseModel):
    """Paginated department listing."""

    items: list[DepartmentResponse]
    page: int
    page_size: int
    total: int
