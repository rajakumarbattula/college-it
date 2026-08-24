from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
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
