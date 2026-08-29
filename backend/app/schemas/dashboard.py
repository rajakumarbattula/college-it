"""Pydantic schemas for dashboard content and aggregation."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

from app.models.achievement import AchievementCategory
from app.models.event import EventType
from app.models.notification import NotificationPriority


class AchievementAttributes(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    student_id: UUID | None = None
    student_display_name: str = Field(min_length=1, max_length=201)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5_000)
    category: AchievementCategory
    achievement_date: date
    image_url: HttpUrl | None = None
    featured: bool = False


class AchievementCreate(AchievementAttributes):
    pass


class AchievementUpdate(AchievementAttributes):
    pass


class AchievementResponse(AchievementAttributes):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class EventAttributes(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5_000)
    event_date: datetime
    location: str = Field(min_length=1, max_length=200)
    event_type: EventType
    image_url: HttpUrl | None = None
    featured: bool = False


class EventCreate(EventAttributes):
    pass


class EventUpdate(EventAttributes):
    pass


class EventResponse(EventAttributes):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class NotificationAttributes(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5_000)
    published_at: datetime
    expires_at: datetime | None = None
    priority: NotificationPriority = NotificationPriority.NORMAL
    active: bool = True

    @model_validator(mode="after")
    def validate_expiry(self) -> "NotificationAttributes":
        if self.expires_at is not None and self.expires_at < self.published_at:
            raise ValueError("Expiry date must not be before publication date")
        return self


class NotificationCreate(NotificationAttributes):
    pass


class NotificationUpdate(NotificationAttributes):
    pass


class NotificationResponse(NotificationAttributes):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class GalleryAttributes(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    event_id: UUID | None = None
    caption: str = Field(min_length=1, max_length=300)
    image_url: HttpUrl
    display_order: int = Field(default=0, ge=0)
    featured: bool = False


class GalleryCreate(GalleryAttributes):
    pass


class GalleryUpdate(GalleryAttributes):
    pass


class GalleryResponse(GalleryAttributes):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime


class DashboardStatistics(BaseModel):
    total_students: int
    total_faculty: int
    total_active_departments: int
    upcoming_events: int


class DashboardResponse(BaseModel):
    statistics: DashboardStatistics
    featured_achievements: list[AchievementResponse]
    upcoming_events: list[EventResponse]
    notifications: list[NotificationResponse]
    gallery: list[GalleryResponse]
