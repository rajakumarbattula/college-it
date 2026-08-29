"""Business operations for students."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.student import Student
from app.repositories.student import StudentRepository
from app.schemas.student import StudentCreate, StudentUpdate


class StudentService:
    """Coordinate student validation and persistence."""

    def __init__(self, repository: StudentRepository | None = None) -> None:
        self.repository = repository or StudentRepository()

    def create(self, session: Session, student_data: StudentCreate) -> Student:
        self._ensure_department_exists(session, student_data.department_id)
        student = Student(**student_data.model_dump())
        self.repository.add(session, student)
        self._commit(session)
        session.refresh(student)
        return student

    def get_or_404(self, session: Session, student_id: UUID) -> Student:
        student = self.repository.get(session, student_id)
        if student is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        return student

    def list(
        self,
        session: Session,
        *,
        page: int,
        page_size: int,
        name: str | None,
        student_number: str | None,
    ) -> tuple[list[Student], int]:
        return self.repository.list(
            session,
            page=page,
            page_size=page_size,
            name=name,
            student_number=student_number,
        )

    def replace(self, session: Session, student_id: UUID, student_data: StudentUpdate) -> Student:
        student = self.get_or_404(session, student_id)
        self._ensure_department_exists(session, student_data.department_id)
        for field_name, value in student_data.model_dump().items():
            setattr(student, field_name, value)
        self._commit(session)
        session.refresh(student)
        return student

    def delete(self, session: Session, student_id: UUID) -> None:
        student = self.get_or_404(session, student_id)
        self.repository.delete(session, student)
        self._commit(session)

    @staticmethod
    def _ensure_department_exists(session: Session, department_id: UUID) -> None:
        department = session.get(Department, department_id)
        if department is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )
        if not department.active:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Department is inactive"
            )

    @staticmethod
    def _commit(session: Session) -> None:
        try:
            session.commit()
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A student with the same student number or email already exists",
            ) from error
