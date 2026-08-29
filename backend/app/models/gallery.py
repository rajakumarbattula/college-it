"""Cultural event gallery persistence model."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.event import CollegeEvent


class GalleryPhoto(TimestampMixin, Base):
    __tablename__ = "gallery_photos"
    __table_args__ = (Index("ix_gallery_featured_order", "featured", "display_order"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("events.id", ondelete="SET NULL"), nullable=True
    )
    caption: Mapped[str] = mapped_column(String(300), nullable=False)
    image_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    display_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    event: Mapped["CollegeEvent | None"] = relationship(back_populates="gallery_photos")
