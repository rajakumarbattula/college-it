"""Database access operations for users."""

from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Persist and retrieve users."""

    def get(self, session: Session, user_id: UUID) -> User | None:
        return session.get(User, user_id)

    def get_by_email(self, session: Session, email: str) -> User | None:
        return session.scalar(select(User).where(func.lower(User.email) == email.lower()))

    def list(self, session: Session, *, page: int, page_size: int) -> tuple[list[User], int]:
        statement: Select[tuple[User]] = select(User)
        total = session.scalar(select(func.count()).select_from(statement.subquery())) or 0
        users = session.scalars(
            statement.order_by(User.email, User.id).offset((page - 1) * page_size).limit(page_size)
        ).all()
        return users, total

    def add(self, session: Session, user: User) -> User:
        session.add(user)
        return user
