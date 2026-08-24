from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.faculty import Faculty
from app.models.student import Student


def department_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "code": "CSE",
        "name": "Computer Science",
        "description": "Computing and software engineering.",
    }
    payload.update(overrides)
    return payload


def create_department(session: Session, **overrides: object) -> Department:
    department = Department(**department_payload(**overrides))
    session.add(department)
    session.commit()
    session.refresh(department)
    return department


def test_create_department(client: TestClient) -> None:
    response = client.post("/api/v1/departments", json=department_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["code"] == "CSE"
    assert body["name"] == "Computer Science"
    assert UUID(body["id"])


def test_create_department_validates_and_rejects_duplicates(client: TestClient) -> None:
    invalid_response = client.post("/api/v1/departments", json={})
    client.post("/api/v1/departments", json=department_payload())
    duplicate_response = client.post("/api/v1/departments", json=department_payload())

    assert invalid_response.status_code == 422
    assert duplicate_response.status_code == 409


def test_list_departments_paginates_and_searches(client: TestClient, db_session: Session) -> None:
    create_department(db_session, code="CSE", name="Computer Science")
    create_department(db_session, code="ECE", name="Electronics")
    create_department(db_session, code="ME", name="Mechanical Engineering")

    paginated_response = client.get("/api/v1/departments?page=2&page_size=1")
    name_response = client.get("/api/v1/departments?search=elect")
    code_response = client.get("/api/v1/departments?search=me")

    assert paginated_response.status_code == 200
    assert paginated_response.json()["total"] == 3
    assert len(paginated_response.json()["items"]) == 1
    assert [item["code"] for item in name_response.json()["items"]] == ["ECE"]
    assert [item["code"] for item in code_response.json()["items"]] == ["ME"]


def test_get_department_and_handle_missing_department(
    client: TestClient, db_session: Session
) -> None:
    department = create_department(db_session)

    response = client.get(f"/api/v1/departments/{department.id}")
    missing_response = client.get(f"/api/v1/departments/{uuid4()}")

    assert response.status_code == 200
    assert response.json()["id"] == str(department.id)
    assert missing_response.status_code == 404


def test_replace_department(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)

    response = client.put(
        f"/api/v1/departments/{department.id}",
        json=department_payload(code="ECE", name="Electronics and Communication", description=None),
    )

    assert response.status_code == 200
    assert response.json()["code"] == "ECE"
    assert response.json()["description"] is None


def test_delete_department_and_prevent_deleting_referenced_department(
    client: TestClient, db_session: Session
) -> None:
    empty_department = create_department(db_session, code="ECE", name="Electronics")
    referenced_department = create_department(db_session)
    db_session.add(
        Student(
            student_number="STU-001",
            first_name="Asha",
            last_name="Patel",
            email="asha.patel@college.example",
            department_id=referenced_department.id,
        )
    )
    db_session.add(
        Faculty(
            employee_number="FAC-001",
            first_name="Ravi",
            last_name="Shah",
            email="ravi.shah@college.example",
            designation="Lecturer",
            department_id=referenced_department.id,
        )
    )
    db_session.commit()

    delete_response = client.delete(f"/api/v1/departments/{empty_department.id}")
    blocked_response = client.delete(f"/api/v1/departments/{referenced_department.id}")
    missing_response = client.delete(f"/api/v1/departments/{uuid4()}")

    assert delete_response.status_code == 204
    assert blocked_response.status_code == 409
    assert blocked_response.json()["detail"] == (
        "Cannot delete a department with assigned students or faculty"
    )
    assert missing_response.status_code == 404
