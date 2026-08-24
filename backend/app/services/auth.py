"""Authentication service operations."""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest


class AuthService:
    """Authenticate existing users without exposing account details on failure."""

    def __init__(self, repository: UserRepository | None = None) -> None:
        self.repository = repository or UserRepository()

    def login(self, session: Session, credentials: LoginRequest) -> tuple[str, int]:
        user = self.repository.get_by_email(session, credentials.email)
        if (
            user is None
            or not user.is_active
            or not verify_password(credentials.password, user.password_hash)
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return create_access_token(user)
