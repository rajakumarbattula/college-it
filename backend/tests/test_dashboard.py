from datetime import UTC, date, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.models.achievement import AchievementCategory, StudentAchievement
from app.models.department import Department
from app.models.event import CollegeEvent, EventType
from app.models.faculty import Faculty
from app.models.gallery import GalleryPhoto
from app.models.notification import Notification, NotificationPriority
from app.models.student import Student
from app.models.user import User, UserRole


def dashboard_data(session: Session) -> None:
    department = Department(code="CS", name="Computer Science")
    student = Student(
        student_number="STU-001",
        first_name="Asha",
        last_name="Reddy",
        email="asha.reddy@college.example",
        department=department,
    )
    faculty_member = Faculty(
        employee_number="FAC-001",
        first_name="Ravi",
        last_name="Kumar",
        email="ravi.kumar@college.example",
        designation="Lecturer",
        department=department,
    )
    now = datetime.now(UTC)
    future_event = CollegeEvent(
        title="Cultural Festival",
        description="Annual cultural festival",
        event_date=now + timedelta(days=2),
        location="Auditorium",
        event_type=EventType.CULTURAL,
        featured=True,
    )
    past_event = CollegeEvent(
        title="Past Event",
        description="Already completed",
        event_date=now - timedelta(days=1),
        location="Campus",
        event_type=EventType.ACADEMIC,
    )
    session.add_all([department, student, faculty_member, future_event, past_event])
    session.flush()
    session.add_all(
        [
            StudentAchievement(
                student=student,
                student_display_name="Asha Reddy",
                title="Science Fair Winner",
                description="Won first place",
                category=AchievementCategory.ACADEMIC,
                achievement_date=date.today(),
                featured=True,
            ),
            StudentAchievement(
                student_display_name="Another Student",
                title="Not Featured",
                description="Hidden from dashboard",
                category=AchievementCategory.OTHER,
                achievement_date=date.today(),
                featured=False,
            ),
            Notification(
                title="Admissions Open",
                message="Applications are open.",
                published_at=now - timedelta(days=1),
                priority=NotificationPriority.HIGH,
                active=True,
            ),
            Notification(
                title="Expired Notice",
                message="Do not show.",
                published_at=now - timedelta(days=3),
                expires_at=now - timedelta(days=1),
                active=True,
            ),
            Notification(
                title="Future Notice",
                message="Do not show yet.",
                published_at=now + timedelta(days=1),
                active=True,
            ),
            GalleryPhoto(
                event=future_event,
                caption="Cultural performance",
                image_url="https://example.com/culture.jpg",
                display_order=1,
                featured=True,
            ),
            GalleryPhoto(
                caption="Not featured",
                image_url="https://example.com/hidden.jpg",
                display_order=2,
                featured=False,
            ),
        ]
    )
    session.commit()


def test_dashboard_aggregates_active_content_and_statistics(
    client: TestClient, db_session: Session
) -> None:
    dashboard_data(db_session)

    response = client.get("/api/v1/dashboard")

    assert response.status_code == 200
    body = response.json()
    assert body["statistics"] == {
        "total_students": 1,
        "total_faculty": 1,
        "total_active_departments": 1,
        "upcoming_events": 1,
    }
    assert [item["title"] for item in body["featured_achievements"]] == ["Science Fair Winner"]
    assert [item["title"] for item in body["upcoming_events"]] == ["Cultural Festival"]
    assert [item["title"] for item in body["notifications"]] == ["Admissions Open"]
    assert [item["caption"] for item in body["gallery"]] == ["Cultural performance"]


def test_dashboard_requires_authentication_and_privileges_content_changes(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    student_user = User(
        email="student@college.example",
        password_hash="not-used-in-this-test",
        role=UserRole.STUDENT,
    )
    db_session.add(student_user)
    db_session.commit()
    token, _ = create_access_token(student_user)
    headers = {"Authorization": f"Bearer {token}"}

    unauthenticated_response = unauthenticated_client.get("/api/v1/dashboard")
    read_response = unauthenticated_client.get("/api/v1/dashboard", headers=headers)
    create_response = unauthenticated_client.post(
        "/api/v1/dashboard/events",
        headers=headers,
        json={
            "title": "Blocked Event",
            "description": "Students cannot publish events.",
            "event_date": "2030-01-01T10:00:00Z",
            "location": "Campus",
            "event_type": "CULTURAL",
        },
    )

    assert unauthenticated_response.status_code == 401
    assert read_response.status_code == 200
    assert create_response.status_code == 403


def test_privileged_user_can_create_dashboard_content(client: TestClient) -> None:
    response = client.post(
        "/api/v1/dashboard/events",
        json={
            "title": "Orientation",
            "description": "Welcome event for new students.",
            "event_date": "2030-01-01T10:00:00Z",
            "location": "Auditorium",
            "event_type": "ACADEMIC",
            "featured": True,
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Orientation"
    assert response.json()["featured"] is True
