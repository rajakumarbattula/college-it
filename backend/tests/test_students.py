from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.student import Student


def create_department(session: Session, *, code: str = "CSE") -> Department:
    department = Department(code=code, name=f"{code} Department")
    session.add(department)
    session.commit()
    session.refresh(department)
    return department


def student_payload(department_id: UUID, **overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "student_number": "STU-001",
        "first_name": "Asha",
        "last_name": "Patel",
        "email": "asha.patel@college.example",
        "status": "active",
        "department_id": str(department_id),
    }
    payload.update(overrides)
    return payload


def create_student(session: Session, department_id: UUID, **overrides: object) -> Student:
    values = student_payload(department_id, **overrides)
    values["department_id"] = department_id
    student = Student(**values)
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def test_create_student(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)

    response = client.post("/api/v1/students", json=student_payload(department.id))

    assert response.status_code == 201
    body = response.json()
    assert body["student_number"] == "STU-001"
    assert body["department_id"] == str(department.id)
    assert UUID(body["id"])


def test_create_student_validates_payload_and_department(client: TestClient) -> None:
    invalid_response = client.post("/api/v1/students", json={})
    missing_department_response = client.post("/api/v1/students", json=student_payload(uuid4()))

    assert invalid_response.status_code == 422
    assert missing_department_response.status_code == 404
    assert missing_department_response.json()["detail"] == "Department not found"


def test_create_student_rejects_duplicate_identifiers(
    client: TestClient, db_session: Session
) -> None:
    department = create_department(db_session)
    payload = student_payload(department.id)

    client.post("/api/v1/students", json=payload)
    response = client.post("/api/v1/students", json=payload)

    assert response.status_code == 409


def test_list_students_paginates_and_filters(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    create_student(db_session, department.id, student_number="STU-001", first_name="Asha")
    create_student(
        db_session,
        department.id,
        student_number="STU-002",
        first_name="Arjun",
        last_name="Singh",
        email="arjun.singh@college.example",
    )
    create_student(
        db_session,
        department.id,
        student_number="STU-003",
        first_name="Mina",
        last_name="Das",
        email="mina.das@college.example",
    )

    paginated_response = client.get("/api/v1/students?page=2&page_size=1")
    name_response = client.get("/api/v1/students?name=arjun")
    number_response = client.get("/api/v1/students?student_number=003")

    assert paginated_response.status_code == 200
    assert paginated_response.json()["total"] == 3
    assert len(paginated_response.json()["items"]) == 1
    assert [item["student_number"] for item in name_response.json()["items"]] == ["STU-002"]
    assert [item["student_number"] for item in number_response.json()["items"]] == ["STU-003"]


def test_get_student_and_handle_missing_student(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    student = create_student(db_session, department.id)

    response = client.get(f"/api/v1/students/{student.id}")
    missing_response = client.get(f"/api/v1/students/{uuid4()}")

    assert response.status_code == 200
    assert response.json()["id"] == str(student.id)
    assert missing_response.status_code == 404
    assert missing_response.json()["detail"] == "Student not found"


def test_replace_student(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    replacement_department = create_department(db_session, code="ECE")
    student = create_student(db_session, department.id)

    response = client.put(
        f"/api/v1/students/{student.id}",
        json=student_payload(
            replacement_department.id,
            student_number="STU-010",
            first_name="Asha",
            last_name="Sharma",
            email="asha.sharma@college.example",
            status="inactive",
        ),
    )

    assert response.status_code == 200
    assert response.json()["student_number"] == "STU-010"
    assert response.json()["department_id"] == str(replacement_department.id)
    assert response.json()["status"] == "inactive"


def test_delete_student(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    student = create_student(db_session, department.id)

    response = client.delete(f"/api/v1/students/{student.id}")
    fetch_response = client.get(f"/api/v1/students/{student.id}")

    assert response.status_code == 204
    assert response.content == b""
    assert fetch_response.status_code == 404
