"""Database access operations for departments."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.department import CourseCategory, Department


class DepartmentRepository:
    """Persist and retrieve department records."""

    def get(self, session: Session, department_id: UUID) -> Department | None:
        return session.get(Department, department_id)

    def list(
        self,
        session: Session,
        *,
        page: int,
        page_size: int,
        search: str | None = None,
        category: CourseCategory | None = None,
    ) -> tuple[list[Department], int]:
        statement: Select[tuple[Department]] = select(Department)
        if search:
            pattern = f"%{search.strip()}%"
            statement = statement.where(
                or_(Department.code.ilike(pattern), Department.name.ilike(pattern))
            )
        if category is not None:
            statement = statement.where(Department.category == category)

        total = session.scalar(select(func.count()).select_from(statement.subquery())) or 0
        departments = session.scalars(
            statement.order_by(Department.code, Department.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
        return departments, total

    def add(self, session: Session, department: Department) -> Department:
        session.add(department)
        return department

    def delete(self, session: Session, department: Department) -> None:
        session.delete(department)
