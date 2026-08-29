"""SQLAlchemy ORM models."""

from app.models.achievement import AchievementCategory, StudentAchievement
from app.models.department import CourseCategory, Department
from app.models.event import CollegeEvent, EventType
from app.models.faculty import Faculty
from app.models.gallery import GalleryPhoto
from app.models.notification import Notification, NotificationPriority
from app.models.student import Student, StudentStatus
from app.models.user import User, UserRole

__all__ = [
    "CourseCategory",
    "AchievementCategory",
    "CollegeEvent",
    "Department",
    "EventType",
    "Faculty",
    "GalleryPhoto",
    "Notification",
    "NotificationPriority",
    "Student",
    "StudentAchievement",
    "StudentStatus",
    "User",
    "UserRole",
]
