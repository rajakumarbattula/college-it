"""Database access operations for faculty."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.faculty import Faculty


class FacultyRepository:
    """Persist and retrieve faculty records."""

    def get(self, session: Session, faculty_id: UUID) -> Faculty | None:
        return session.get(Faculty, faculty_id)

    def list(
        self,
        session: Session,
        *,
        page: int,
        page_size: int,
        name: str | None = None,
        employee_number: str | None = None,
    ) -> tuple[list[Faculty], int]:
        statement: Select[tuple[Faculty]] = select(Faculty)
        if name:
            pattern = f"%{name.strip()}%"
            statement = statement.where(
                or_(
                    Faculty.first_name.ilike(pattern),
                    Faculty.last_name.ilike(pattern),
                    (Faculty.first_name + " " + Faculty.last_name).ilike(pattern),
                )
            )
        if employee_number:
            statement = statement.where(
                Faculty.employee_number.ilike(f"%{employee_number.strip()}%")
            )

        total = session.scalar(select(func.count()).select_from(statement.subquery())) or 0
        faculty_members = session.scalars(
            statement.order_by(Faculty.last_name, Faculty.first_name, Faculty.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
        return faculty_members, total

    def add(self, session: Session, faculty_member: Faculty) -> Faculty:
        session.add(faculty_member)
        return faculty_member

    def delete(self, session: Session, faculty_member: Faculty) -> None:
        session.delete(faculty_member)
