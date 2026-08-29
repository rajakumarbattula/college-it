from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.student import Student
from app.models.user import User, UserRole


def create_user(
    session: Session,
    *,
    email: str,
    password: str = "SecurePassword123!",
    role: UserRole = UserRole.STAFF,
    is_active: bool = True,
) -> User:
    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
        is_active=is_active,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def registration_payload(**overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "full_name": "Asha Reddy",
        "email": "asha.reddy@college.example",
        "password": "SecurePassword123!",
    }
    payload.update(overrides)
    return payload


def test_public_registration_creates_an_account_but_not_an_enrolled_student(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    response = unauthenticated_client.post("/api/v1/auth/register", json=registration_payload())

    assert response.status_code == 201
    assert response.json() == {
        "full_name": "Asha Reddy",
        "email": "asha.reddy@college.example",
    }
    enrolled_student = db_session.scalar(
        select(Student).where(Student.email == "asha.reddy@college.example")
    )
    assert enrolled_student is None


def test_public_registration_rejects_duplicate_and_invalid_payloads(
    unauthenticated_client: TestClient,
) -> None:
    first_response = unauthenticated_client.post(
        "/api/v1/auth/register", json=registration_payload()
    )
    duplicate_response = unauthenticated_client.post(
        "/api/v1/auth/register", json=registration_payload()
    )
    invalid_email_response = unauthenticated_client.post(
        "/api/v1/auth/register", json=registration_payload(email="not-an-email")
    )
    weak_password_response = unauthenticated_client.post(
        "/api/v1/auth/register", json=registration_payload(password="short")
    )
    missing_name_response = unauthenticated_client.post(
        "/api/v1/auth/register",
        json={"email": "missing@college.example", "password": "SecurePassword123!"},
    )

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["detail"] == "A user with the same email already exists"
    assert invalid_email_response.status_code == 422
    assert weak_password_response.status_code == 422
    assert missing_name_response.status_code == 422


def test_public_registration_rejects_privileged_role_and_hashes_password(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    privileged_role_response = unauthenticated_client.post(
        "/api/v1/auth/register", json=registration_payload(role="admin")
    )
    registration_response = unauthenticated_client.post(
        "/api/v1/auth/register",
        json=registration_payload(email="hash.registration@college.example"),
    )
    user = db_session.scalar(select(User).where(User.email == "hash.registration@college.example"))

    assert privileged_role_response.status_code == 422
    assert registration_response.status_code == 201
    assert user is not None
    assert user.role is UserRole.STUDENT
    assert user.password_hash != "SecurePassword123!"
    assert verify_password("SecurePassword123!", user.password_hash)


def test_registered_student_cannot_access_management_resources(
    unauthenticated_client: TestClient,
) -> None:
    unauthenticated_client.post("/api/v1/auth/register", json=registration_payload())
    login_response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "asha.reddy@college.example", "password": "SecurePassword123!"},
    )

    response = unauthenticated_client.get(
        "/api/v1/students",
        headers={"Authorization": f"Bearer {login_response.json()['access_token']}"},
    )

    assert login_response.status_code == 200
    assert response.status_code == 403


def test_login_returns_a_bearer_token(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    create_user(db_session, email="staff@college.example", password="SecurePassword123!")

    response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "staff@college.example", "password": "SecurePassword123!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["expires_in"] > 0


def test_login_rejects_invalid_or_inactive_credentials(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    create_user(
        db_session,
        email="inactive@college.example",
        is_active=False,
    )

    unknown_response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "missing@college.example", "password": "SecurePassword123!"},
    )
    inactive_response = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@college.example", "password": "SecurePassword123!"},
    )

    assert unknown_response.status_code == 401
    assert inactive_response.status_code == 401
    assert unknown_response.json()["detail"] == "Invalid email or password"


def test_protected_resources_require_a_valid_token(unauthenticated_client: TestClient) -> None:
    missing_token_response = unauthenticated_client.get("/api/v1/students")
    invalid_token_response = unauthenticated_client.get(
        "/api/v1/departments", headers={"Authorization": "Bearer invalid"}
    )

    assert missing_token_response.status_code == 401
    assert invalid_token_response.status_code == 401
    assert missing_token_response.headers["www-authenticate"] == "Bearer"


def test_admin_can_create_and_modify_users(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/users",
        json={
            "email": "faculty@college.example",
            "password": "AnotherSecure123!",
            "role": "faculty",
        },
    )

    assert create_response.status_code == 201
    created_user = create_response.json()
    assert created_user["role"] == "faculty"
    assert "password_hash" not in created_user

    update_response = client.patch(
        f"/api/v1/users/{created_user['id']}",
        json={"role": "staff", "is_active": False},
    )

    assert update_response.status_code == 200
    assert update_response.json()["role"] == "staff"
    assert update_response.json()["is_active"] is False


def test_user_passwords_are_hashed(client: TestClient, db_session: Session) -> None:
    response = client.post(
        "/api/v1/users",
        json={
            "email": "hash-check@college.example",
            "password": "AnotherSecure123!",
            "role": "staff",
        },
    )
    user = db_session.get(User, UUID(response.json()["id"]))

    assert response.status_code == 201
    assert user is not None
    assert user.password_hash != "AnotherSecure123!"
    assert verify_password("AnotherSecure123!", user.password_hash)


def test_non_admin_cannot_manage_users_but_can_access_protected_resources(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    staff_user = create_user(db_session, email="staff@college.example")
    access_token, _ = create_access_token(staff_user)
    headers = {"Authorization": f"Bearer {access_token}"}

    user_response = unauthenticated_client.post(
        "/api/v1/users",
        json={
            "email": "new-user@college.example",
            "password": "AnotherSecure123!",
            "role": "staff",
        },
        headers=headers,
    )
    resource_response = unauthenticated_client.get("/api/v1/faculty", headers=headers)

    assert user_response.status_code == 403
    assert resource_response.status_code == 200


def test_token_is_rejected_when_user_role_changes(
    unauthenticated_client: TestClient, db_session: Session
) -> None:
    user = create_user(db_session, email="role-change@college.example", role=UserRole.STAFF)
    access_token, _ = create_access_token(user)
    user.role = UserRole.FACULTY
    db_session.commit()

    response = unauthenticated_client.get(
        "/api/v1/students", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 401
