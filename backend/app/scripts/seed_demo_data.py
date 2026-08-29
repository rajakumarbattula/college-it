"""Seed fictional dashboard content for development and demo environments."""

from datetime import UTC, date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.achievement import AchievementCategory, StudentAchievement
from app.models.department import Department
from app.models.event import CollegeEvent, EventType
from app.models.gallery import GalleryPhoto
from app.models.notification import Notification, NotificationPriority
from app.models.student import Student, StudentStatus


def seed_demo_data(session: Session) -> None:
    """Create or update the fixed demo dataset without inserting credentials."""
    if get_settings().app_env.lower() in {"production", "prod"}:
        raise RuntimeError("Demo data seeding is disabled in production environments")

    departments = _departments(session)
    students = _students(session, departments)
    events = _events(session)
    _achievements(session, students)
    _notifications(session)
    _gallery(session, events)
    session.commit()


def _departments(session: Session) -> dict[str, Department]:
    records = session.scalars(
        select(Department).where(Department.code.in_(("CS", "EE", "MPC", "BIPC")))
    ).all()
    departments = {department.code: department for department in records}
    missing = {"CS", "EE", "MPC", "BIPC"} - departments.keys()
    if missing:
        raise RuntimeError(f"Required course records are missing: {', '.join(sorted(missing))}")
    return departments


def _students(session: Session, departments: dict[str, Department]) -> dict[str, Student]:
    records = (
        ("DEMO-STU-001", "Anaya", "Mehta", "demo.anaya@example.invalid", "CS"),
        ("DEMO-STU-002", "Vihaan", "Rao", "demo.vihaan@example.invalid", "MPC"),
        ("DEMO-STU-003", "Kavya", "Iyer", "demo.kavya@example.invalid", "EE"),
        ("DEMO-STU-004", "Arjun", "Nair", "demo.arjun@example.invalid", "BIPC"),
    )
    students: dict[str, Student] = {}
    for student_number, first_name, last_name, email, course_code in records:
        student = session.scalar(select(Student).where(Student.student_number == student_number))
        if student is None:
            student = Student(student_number=student_number)
            session.add(student)
        student.first_name = first_name
        student.last_name = last_name
        student.email = email
        student.department = departments[course_code]
        student.status = StudentStatus.ACTIVE
        students[student_number] = student
    session.flush()
    return students


def _events(session: Session) -> dict[str, CollegeEvent]:
    now = datetime.now(UTC)
    records = (
        (
            "Science Exhibition",
            "Student projects and demonstrations.",
            7,
            "Science Block",
            EventType.ACADEMIC,
        ),
        (
            "Parent-Teacher Meeting",
            "Progress discussion with parents and faculty.",
            12,
            "College Hall",
            EventType.ACADEMIC,
        ),
        (
            "Intermediate Practical Examination Orientation",
            "Lab procedures and examination guidance.",
            18,
            "Physics Laboratory",
            EventType.ACADEMIC,
        ),
        (
            "Cultural Day",
            "Fictional student performances and celebrations.",
            25,
            "Open Auditorium",
            EventType.CULTURAL,
        ),
        (
            "Career Guidance Session",
            "Higher education and career planning session.",
            32,
            "Seminar Hall",
            EventType.OTHER,
        ),
    )
    events: dict[str, CollegeEvent] = {}
    for title, description, days_from_now, location, event_type in records:
        event = session.scalar(select(CollegeEvent).where(CollegeEvent.title == title))
        if event is None:
            event = CollegeEvent(title=title)
            session.add(event)
        event.description = description
        event.event_date = now + timedelta(days=days_from_now)
        event.location = location
        event.event_type = event_type
        event.featured = event_type is EventType.CULTURAL
        event.image_url = "/demo-assets/cultural-day.svg" if event.featured else None
        events[title] = event
    session.flush()
    return events


def _achievements(session: Session, students: dict[str, Student]) -> None:
    records = (
        (
            "Academic Excellence Award",
            "DEMO-STU-001",
            AchievementCategory.ACADEMIC,
            "Consistent excellence in fictional internal assessments.",
            "/demo-assets/academic-achievement.svg",
        ),
        (
            "Regional Science Fair Recognition",
            "DEMO-STU-002",
            AchievementCategory.ACADEMIC,
            "A fictional low-cost water quality experiment was recognised at a science fair.",
            "/demo-assets/science-fair.svg",
        ),
        (
            "Inter-College Athletics Medal",
            "DEMO-STU-003",
            AchievementCategory.SPORTS,
            "A fictional athletics relay team achievement.",
            "/demo-assets/sports-achievement.svg",
        ),
        (
            "Student Coding Challenge Finalist",
            "DEMO-STU-004",
            AchievementCategory.OTHER,
            "A fictional team was selected as a technical competition finalist.",
            "/demo-assets/coding-challenge.svg",
        ),
    )
    for title, student_number, category, description, image_url in records:
        achievement = session.scalar(
            select(StudentAchievement).where(StudentAchievement.title == title)
        )
        student = students[student_number]
        if achievement is None:
            achievement = StudentAchievement(title=title)
            session.add(achievement)
        achievement.student = student
        achievement.student_display_name = f"{student.first_name} {student.last_name}"
        achievement.description = description
        achievement.category = category
        achievement.achievement_date = date.today() - timedelta(days=7)
        achievement.image_url = image_url
        achievement.featured = True


def _notifications(session: Session) -> None:
    now = datetime.now(UTC)
    records = (
        (
            "Intermediate Examination Timetable",
            "The sample examination timetable is available from the office notice board.",
            NotificationPriority.HIGH,
        ),
        (
            "Scholarship Application Notice",
            "Eligible students may submit fictional sample scholarship applications "
            "before the stated deadline.",
            NotificationPriority.NORMAL,
        ),
        (
            "College Holiday Announcement",
            "The college will observe a sample holiday following the local academic calendar.",
            NotificationPriority.NORMAL,
        ),
        (
            "Practical Laboratory Schedule",
            "Students should review the updated sample practical laboratory schedule.",
            NotificationPriority.HIGH,
        ),
    )
    for title, message, priority in records:
        notification = session.scalar(select(Notification).where(Notification.title == title))
        if notification is None:
            notification = Notification(title=title)
            session.add(notification)
        notification.message = message
        notification.published_at = now - timedelta(hours=1)
        notification.expires_at = now + timedelta(days=30)
        notification.priority = priority
        notification.active = True


def _gallery(session: Session, events: dict[str, CollegeEvent]) -> None:
    records = (
        ("Cultural Day stage rehearsal", "/demo-assets/cultural-day.svg", "Cultural Day", 1),
        ("Student science display", "/demo-assets/science-fair.svg", "Science Exhibition", 2),
        ("College celebration banner", "/demo-assets/academic-achievement.svg", "Cultural Day", 3),
    )
    for caption, image_url, event_title, display_order in records:
        photo = session.scalar(select(GalleryPhoto).where(GalleryPhoto.caption == caption))
        if photo is None:
            photo = GalleryPhoto(caption=caption)
            session.add(photo)
        photo.event = events[event_title]
        photo.image_url = image_url
        photo.display_order = display_order
        photo.featured = True


def main() -> None:
    session = SessionLocal()
    try:
        seed_demo_data(session)
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
