"""Pydantic schemas for administrator-managed users."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserCreate(BaseModel):
    """Payload for an administrator to create a user."""

    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    role: UserRole

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return value.lower()


class UserUpdate(BaseModel):
    """Fields an administrator may change for an existing user."""

    model_config = ConfigDict(str_strip_whitespace=True)

    password: str | None = Field(default=None, min_length=12, max_length=128)
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    """Safe user representation; never includes password hashes."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseModel):
    """Paginated user listing for administrators."""

    items: list[UserResponse]
    page: int
    page_size: int
    total: int
