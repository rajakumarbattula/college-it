"""Pydantic schemas for authentication requests and responses."""

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    """Credentials accepted by the login endpoint."""

    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return value.lower()


class AccessTokenResponse(BaseModel):
    """A successful login response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
