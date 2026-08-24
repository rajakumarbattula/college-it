"""Administrator-managed user operations."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Create and update users on behalf of administrators."""

    def __init__(self, repository: UserRepository | None = None) -> None:
        self.repository = repository or UserRepository()

    def create(self, session: Session, user_data: UserCreate) -> User:
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            role=user_data.role,
        )
        self.repository.add(session, user)
        self._commit(session)
        session.refresh(user)
        return user

    def get_or_404(self, session: Session, user_id: UUID) -> User:
        user = self.repository.get(session, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    def list(self, session: Session, *, page: int, page_size: int) -> tuple[list[User], int]:
        return self.repository.list(session, page=page, page_size=page_size)

    def update(self, session: Session, user_id: UUID, user_data: UserUpdate) -> User:
        user = self.get_or_404(session, user_id)
        changes = user_data.model_dump(exclude_unset=True)
        if "password" in changes:
            user.password_hash = hash_password(changes.pop("password"))
        for field_name, value in changes.items():
            setattr(user, field_name, value)
        self._commit(session)
        session.refresh(user)
        return user

    @staticmethod
    def _commit(session: Session) -> None:
        try:
            session.commit()
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with the same email already exists",
            ) from error
