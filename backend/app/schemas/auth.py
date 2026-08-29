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


class RegistrationRequest(BaseModel):
    """Public registration payload for an account, not student enrollment."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    full_name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        if len(value.split()) < 2:
            raise ValueError("Full name must include at least two names")
        return value

    @field_validator("email")
    @classmethod
    def normalize_registration_email(cls, value: EmailStr) -> str:
        return value.lower()


class RegistrationResponse(BaseModel):
    """Safe registration result; never exposes password data."""

    model_config = ConfigDict(from_attributes=True)

    full_name: str
    email: EmailStr


class AccessTokenResponse(BaseModel):
    """A successful login response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
