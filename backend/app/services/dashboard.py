"""Business operations for dashboard content and aggregation."""

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.achievement import StudentAchievement
from app.models.event import CollegeEvent
from app.models.gallery import GalleryPhoto
from app.models.notification import Notification
from app.models.student import Student
from app.repositories.dashboard import DashboardRepository
from app.schemas.dashboard import (
    AchievementCreate,
    AchievementUpdate,
    DashboardResponse,
    EventCreate,
    EventUpdate,
    GalleryCreate,
    GalleryUpdate,
    NotificationCreate,
    NotificationUpdate,
)


class DashboardService:
    """Manage dashboard content and build its single read model."""

    def __init__(self, repository: DashboardRepository | None = None) -> None:
        self.repository = repository or DashboardRepository()

    def dashboard(self, session: Session) -> DashboardResponse:
        now = datetime.now(UTC)
        return DashboardResponse(
            statistics=self.repository.statistics(session, now),
            featured_achievements=self.repository.featured_achievements(session, limit=6),
            upcoming_events=self.repository.upcoming_events(session, now, limit=5),
            notifications=self.repository.active_notifications(session, now, limit=5),
            gallery=self.repository.featured_gallery(session, limit=12),
        )

    def list_achievements(self, session: Session) -> list[StudentAchievement]:
        return self.repository.list_achievements(session)

    def list_events(self, session: Session) -> list[CollegeEvent]:
        return self.repository.list_events(session)

    def list_notifications(self, session: Session) -> list[Notification]:
        return self.repository.list_notifications(session)

    def list_gallery_photos(self, session: Session) -> list[GalleryPhoto]:
        return self.repository.list_gallery_photos(session)

    def create_achievement(self, session: Session, data: AchievementCreate) -> StudentAchievement:
        values = self._values(data)
        values["student_display_name"] = self._student_display_name(
            session, data.student_id, data.student_display_name
        )
        return self._save(session, StudentAchievement(**values))

    def update_achievement(
        self, session: Session, item_id: UUID, data: AchievementUpdate
    ) -> StudentAchievement:
        item = self._get_or_404(session, self.repository.get_achievement, item_id, "Achievement")
        values = self._values(data)
        values["student_display_name"] = self._student_display_name(
            session, data.student_id, data.student_display_name
        )
        return self._replace(session, item, values)

    def delete_achievement(self, session: Session, item_id: UUID) -> None:
        self._delete(
            session,
            self._get_or_404(session, self.repository.get_achievement, item_id, "Achievement"),
        )

    def create_event(self, session: Session, data: EventCreate) -> CollegeEvent:
        return self._save(session, CollegeEvent(**self._values(data)))

    def update_event(self, session: Session, item_id: UUID, data: EventUpdate) -> CollegeEvent:
        item = self._get_or_404(session, self.repository.get_event, item_id, "Event")
        return self._replace(session, item, self._values(data))

    def delete_event(self, session: Session, item_id: UUID) -> None:
        self._delete(
            session, self._get_or_404(session, self.repository.get_event, item_id, "Event")
        )

    def create_notification(self, session: Session, data: NotificationCreate) -> Notification:
        return self._save(session, Notification(**self._values(data)))

    def update_notification(
        self, session: Session, item_id: UUID, data: NotificationUpdate
    ) -> Notification:
        item = self._get_or_404(session, self.repository.get_notification, item_id, "Notification")
        return self._replace(session, item, self._values(data))

    def delete_notification(self, session: Session, item_id: UUID) -> None:
        self._delete(
            session,
            self._get_or_404(session, self.repository.get_notification, item_id, "Notification"),
        )

    def create_gallery_photo(self, session: Session, data: GalleryCreate) -> GalleryPhoto:
        self._ensure_event_exists(session, data.event_id)
        return self._save(session, GalleryPhoto(**self._values(data)))

    def update_gallery_photo(
        self, session: Session, item_id: UUID, data: GalleryUpdate
    ) -> GalleryPhoto:
        item = self._get_or_404(
            session, self.repository.get_gallery_photo, item_id, "Gallery photo"
        )
        self._ensure_event_exists(session, data.event_id)
        return self._replace(session, item, self._values(data))

    def delete_gallery_photo(self, session: Session, item_id: UUID) -> None:
        self._delete(
            session,
            self._get_or_404(session, self.repository.get_gallery_photo, item_id, "Gallery photo"),
        )

    @staticmethod
    def _values(data: Any) -> dict[str, Any]:
        values = data.model_dump()
        if values.get("image_url") is not None:
            values["image_url"] = str(values["image_url"])
        return values

    @staticmethod
    def _get_or_404(session: Session, getter: Any, item_id: UUID, label: str) -> Any:
        item = getter(session, item_id)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{label} not found")
        return item

    def _student_display_name(
        self, session: Session, student_id: UUID | None, fallback: str
    ) -> str:
        if student_id is None:
            return fallback
        student = session.get(Student, student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        return f"{student.first_name} {student.last_name}"

    def _ensure_event_exists(self, session: Session, event_id: UUID | None) -> None:
        if event_id is not None and self.repository.get_event(session, event_id) is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    def _save(self, session: Session, item: Any) -> Any:
        self.repository.add(session, item)
        self._commit(session)
        session.refresh(item)
        return item

    def _replace(self, session: Session, item: Any, values: dict[str, Any]) -> Any:
        for field_name, value in values.items():
            setattr(item, field_name, value)
        self._commit(session)
        session.refresh(item)
        return item

    def _delete(self, session: Session, item: Any) -> None:
        self.repository.delete(session, item)
        self._commit(session)

    @staticmethod
    def _commit(session: Session) -> None:
        session.commit()
