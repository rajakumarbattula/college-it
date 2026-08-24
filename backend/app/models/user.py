"""User persistence model.

This model stores only a password hash. Authentication behavior is intentionally
implemented in a later phase.
"""

import uuid
from enum import StrEnum

from sqlalchemy import Boolean, Enum, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.mixins import TimestampMixin


class UserRole(StrEnum):
    ADMIN = "admin"
    STAFF = "staff"
    VIEWER = "viewer"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
        server_default=UserRole.ADMIN.value,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
