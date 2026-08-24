from uuid import UUID, uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.department import Department


def create_department(session: Session, *, code: str = "CSE") -> Department:
    department = Department(code=code, name=f"{code} Department")
    session.add(department)
    session.commit()
    session.refresh(department)
    return department


def faculty_payload(department_id: UUID, **overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "employee_number": "FAC-001",
        "first_name": "Ravi",
        "last_name": "Shah",
        "email": "ravi.shah@college.example",
        "designation": "Lecturer",
        "department_id": str(department_id),
    }
    payload.update(overrides)
    return payload


def create_faculty(
    client: TestClient, department_id: UUID, **overrides: object
) -> dict[str, object]:
    response = client.post("/api/v1/faculty", json=faculty_payload(department_id, **overrides))
    assert response.status_code == 201
    return response.json()


def test_create_faculty(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)

    response = client.post("/api/v1/faculty", json=faculty_payload(department.id))

    assert response.status_code == 201
    body = response.json()
    assert body["employee_number"] == "FAC-001"
    assert body["department_id"] == str(department.id)
    assert UUID(body["id"])


def test_create_faculty_validates_and_requires_department(client: TestClient) -> None:
    invalid_response = client.post("/api/v1/faculty", json={})
    missing_department_response = client.post("/api/v1/faculty", json=faculty_payload(uuid4()))

    assert invalid_response.status_code == 422
    assert missing_department_response.status_code == 404
    assert missing_department_response.json()["detail"] == "Department not found"


def test_create_faculty_rejects_duplicate_identifiers(
    client: TestClient, db_session: Session
) -> None:
    department = create_department(db_session)
    payload = faculty_payload(department.id)

    client.post("/api/v1/faculty", json=payload)
    response = client.post("/api/v1/faculty", json=payload)

    assert response.status_code == 409


def test_list_faculty_paginates_and_filters(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    create_faculty(client, department.id, employee_number="FAC-001", first_name="Ravi")
    create_faculty(
        client,
        department.id,
        employee_number="FAC-002",
        first_name="Meera",
        last_name="Singh",
        email="meera.singh@college.example",
    )
    create_faculty(
        client,
        department.id,
        employee_number="FAC-003",
        first_name="Anil",
        last_name="Das",
        email="anil.das@college.example",
    )

    paginated_response = client.get("/api/v1/faculty?page=2&page_size=1")
    name_response = client.get("/api/v1/faculty?name=meera")
    number_response = client.get("/api/v1/faculty?employee_number=003")

    assert paginated_response.status_code == 200
    assert paginated_response.json()["total"] == 3
    assert len(paginated_response.json()["items"]) == 1
    assert [item["employee_number"] for item in name_response.json()["items"]] == ["FAC-002"]
    assert [item["employee_number"] for item in number_response.json()["items"]] == ["FAC-003"]


def test_get_faculty_and_handle_missing_faculty(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    faculty_member = create_faculty(client, department.id)

    response = client.get(f"/api/v1/faculty/{faculty_member['id']}")
    missing_response = client.get(f"/api/v1/faculty/{uuid4()}")

    assert response.status_code == 200
    assert response.json()["id"] == faculty_member["id"]
    assert missing_response.status_code == 404
    assert missing_response.json()["detail"] == "Faculty member not found"


def test_replace_faculty(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    replacement_department = create_department(db_session, code="ECE")
    faculty_member = create_faculty(client, department.id)

    response = client.put(
        f"/api/v1/faculty/{faculty_member['id']}",
        json=faculty_payload(
            replacement_department.id,
            employee_number="FAC-010",
            first_name="Ravi",
            last_name="Kumar",
            email="ravi.kumar@college.example",
            designation="Associate Professor",
        ),
    )

    assert response.status_code == 200
    assert response.json()["employee_number"] == "FAC-010"
    assert response.json()["department_id"] == str(replacement_department.id)


def test_delete_faculty(client: TestClient, db_session: Session) -> None:
    department = create_department(db_session)
    faculty_member = create_faculty(client, department.id)

    response = client.delete(f"/api/v1/faculty/{faculty_member['id']}")
    fetch_response = client.get(f"/api/v1/faculty/{faculty_member['id']}")

    assert response.status_code == 204
    assert response.content == b""
    assert fetch_response.status_code == 404
