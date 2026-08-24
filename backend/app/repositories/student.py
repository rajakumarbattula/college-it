"""Database access operations for students."""

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.models.student import Student


class StudentRepository:
    """Persist and retrieve student records."""

    def get(self, session: Session, student_id: UUID) -> Student | None:
        return session.get(Student, student_id)

    def list(
        self,
        session: Session,
        *,
        page: int,
        page_size: int,
        name: str | None = None,
        student_number: str | None = None,
    ) -> tuple[list[Student], int]:
        statement: Select[tuple[Student]] = select(Student)

        if name:
            pattern = f"%{name.strip()}%"
            statement = statement.where(
                or_(
                    Student.first_name.ilike(pattern),
                    Student.last_name.ilike(pattern),
                    (Student.first_name + " " + Student.last_name).ilike(pattern),
                )
            )
        if student_number:
            statement = statement.where(Student.student_number.ilike(f"%{student_number.strip()}%"))

        total = session.scalar(select(func.count()).select_from(statement.subquery())) or 0
        students = session.scalars(
            statement.order_by(Student.last_name, Student.first_name, Student.id)
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
        return students, total

    def add(self, session: Session, student: Student) -> Student:
        session.add(student)
        return student

    def delete(self, session: Session, student: Student) -> None:
        session.delete(student)
