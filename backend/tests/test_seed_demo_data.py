from types import SimpleNamespace

import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.achievement import StudentAchievement
from app.models.department import CourseCategory, Department
from app.models.event import CollegeEvent
from app.models.gallery import GalleryPhoto
from app.models.notification import Notification
from app.models.student import Student
from app.scripts.seed_demo_data import seed_demo_data


def _create_courses(session: Session) -> None:
    session.add_all(
        [
            Department(code="CS", name="Computer Science", category=CourseCategory.VOCATIONAL),
            Department(
                code="EE", name="Electronics and Electrical", category=CourseCategory.VOCATIONAL
            ),
            Department(code="MPC", name="M.P.C", category=CourseCategory.REGULAR),
            Department(code="BIPC", name="Bi.P.C", category=CourseCategory.REGULAR),
        ]
    )
    session.commit()


def test_seed_demo_data_is_idempotent_and_uses_local_demo_assets(
    client, db_session: Session
) -> None:
    _create_courses(db_session)

    seed_demo_data(db_session)
    seed_demo_data(db_session)

    assert db_session.scalar(select(func.count()).select_from(Student)) == 4
    assert db_session.scalar(select(func.count()).select_from(StudentAchievement)) == 4
    assert db_session.scalar(select(func.count()).select_from(CollegeEvent)) == 5
    assert db_session.scalar(select(func.count()).select_from(Notification)) == 4
    assert db_session.scalar(select(func.count()).select_from(GalleryPhoto)) == 3

    response = client.get("/api/v1/dashboard")

    assert response.status_code == 200
    assert all(item["image_url"].startswith("/demo-assets/") for item in response.json()["gallery"])


def test_seed_demo_data_refuses_production(monkeypatch, db_session: Session) -> None:
    monkeypatch.setattr(
        "app.scripts.seed_demo_data.get_settings", lambda: SimpleNamespace(app_env="production")
    )

    with pytest.raises(RuntimeError, match="disabled in production"):
        seed_demo_data(db_session)
