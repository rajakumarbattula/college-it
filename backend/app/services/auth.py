"""Authentication service operations."""

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, RegistrationRequest


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

    def register(self, session: Session, registration: RegistrationRequest) -> User:
        """Create a public account with the fixed least-privileged role."""
        user = User(
            full_name=registration.full_name,
            email=registration.email,
            password_hash=hash_password(registration.password),
            role=UserRole.STUDENT,
        )
        self.repository.add(session, user)
        try:
            session.commit()
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with the same email already exists",
            ) from error
        session.refresh(user)
        return user
