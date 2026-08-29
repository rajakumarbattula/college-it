"""College event persistence model."""

import uuid
from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.gallery import GalleryPhoto


class EventType(StrEnum):
    ACADEMIC = "ACADEMIC"
    CULTURAL = "CULTURAL"
    SPORTS = "SPORTS"
    OTHER = "OTHER"


class CollegeEvent(TimestampMixin, Base):
    __tablename__ = "events"
    __table_args__ = (Index("ix_events_event_date", "event_date"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    event_type: Mapped[EventType] = mapped_column(
        Enum(
            EventType,
            name="event_type",
            values_callable=lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
    )
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    gallery_photos: Mapped[list["GalleryPhoto"]] = relationship(back_populates="event")
