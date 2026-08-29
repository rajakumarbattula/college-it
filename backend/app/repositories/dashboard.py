"""Database access operations for dashboard content."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.achievement import StudentAchievement
from app.models.department import Department
from app.models.event import CollegeEvent
from app.models.faculty import Faculty
from app.models.gallery import GalleryPhoto
from app.models.notification import Notification
from app.models.student import Student


class DashboardRepository:
    def get_achievement(self, session: Session, item_id: UUID) -> StudentAchievement | None:
        return session.get(StudentAchievement, item_id)

    def get_event(self, session: Session, item_id: UUID) -> CollegeEvent | None:
        return session.get(CollegeEvent, item_id)

    def get_notification(self, session: Session, item_id: UUID) -> Notification | None:
        return session.get(Notification, item_id)

    def get_gallery_photo(self, session: Session, item_id: UUID) -> GalleryPhoto | None:
        return session.get(GalleryPhoto, item_id)

    @staticmethod
    def list_achievements(session: Session) -> list[StudentAchievement]:
        return session.scalars(
            select(StudentAchievement).order_by(StudentAchievement.achievement_date.desc())
        ).all()

    @staticmethod
    def list_events(session: Session) -> list[CollegeEvent]:
        return session.scalars(select(CollegeEvent).order_by(CollegeEvent.event_date.desc())).all()

    @staticmethod
    def list_notifications(session: Session) -> list[Notification]:
        return session.scalars(
            select(Notification).order_by(Notification.published_at.desc())
        ).all()

    @staticmethod
    def list_gallery_photos(session: Session) -> list[GalleryPhoto]:
        return session.scalars(
            select(GalleryPhoto).order_by(GalleryPhoto.display_order, GalleryPhoto.id)
        ).all()

    @staticmethod
    def add(session: Session, item: object) -> None:
        session.add(item)

    @staticmethod
    def delete(session: Session, item: object) -> None:
        session.delete(item)

    @staticmethod
    def featured_achievements(session: Session, limit: int) -> list[StudentAchievement]:
        return session.scalars(
            select(StudentAchievement)
            .where(StudentAchievement.featured.is_(True))
            .order_by(StudentAchievement.achievement_date.desc(), StudentAchievement.id)
            .limit(limit)
        ).all()

    @staticmethod
    def upcoming_events(session: Session, now: datetime, limit: int) -> list[CollegeEvent]:
        return session.scalars(
            select(CollegeEvent)
            .where(CollegeEvent.event_date >= now)
            .order_by(CollegeEvent.event_date, CollegeEvent.id)
            .limit(limit)
        ).all()

    @staticmethod
    def active_notifications(session: Session, now: datetime, limit: int) -> list[Notification]:
        return session.scalars(
            select(Notification)
            .where(
                Notification.active.is_(True),
                Notification.published_at <= now,
                or_(Notification.expires_at.is_(None), Notification.expires_at >= now),
            )
            .order_by(Notification.published_at.desc(), Notification.id)
            .limit(limit)
        ).all()

    @staticmethod
    def featured_gallery(session: Session, limit: int) -> list[GalleryPhoto]:
        return session.scalars(
            select(GalleryPhoto)
            .where(GalleryPhoto.featured.is_(True))
            .order_by(GalleryPhoto.display_order, GalleryPhoto.id)
            .limit(limit)
        ).all()

    @staticmethod
    def statistics(session: Session, now: datetime) -> dict[str, int]:
        return {
            "total_students": session.scalar(select(func.count()).select_from(Student)) or 0,
            "total_faculty": session.scalar(select(func.count()).select_from(Faculty)) or 0,
            "total_active_departments": session.scalar(
                select(func.count()).select_from(Department).where(Department.active.is_(True))
            )
            or 0,
            "upcoming_events": session.scalar(
                select(func.count()).select_from(CollegeEvent).where(CollegeEvent.event_date >= now)
            )
            or 0,
        }
