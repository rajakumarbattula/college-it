"""Business operations for departments."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.faculty import Faculty
from app.models.student import Student
from app.repositories.department import DepartmentRepository
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    """Coordinate department validation and persistence."""

    def __init__(self, repository: DepartmentRepository | None = None) -> None:
        self.repository = repository or DepartmentRepository()

    def create(self, session: Session, department_data: DepartmentCreate) -> Department:
        department = Department(**department_data.model_dump())
        self.repository.add(session, department)
        self._commit(session)
        session.refresh(department)
        return department

    def get_or_404(self, session: Session, department_id: UUID) -> Department:
        department = self.repository.get(session, department_id)
        if department is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )
        return department

    def list(
        self, session: Session, *, page: int, page_size: int, search: str | None
    ) -> tuple[list[Department], int]:
        return self.repository.list(session, page=page, page_size=page_size, search=search)

    def replace(
        self, session: Session, department_id: UUID, department_data: DepartmentUpdate
    ) -> Department:
        department = self.get_or_404(session, department_id)
        for field_name, value in department_data.model_dump().items():
            setattr(department, field_name, value)
        self._commit(session)
        session.refresh(department)
        return department

    def delete(self, session: Session, department_id: UUID) -> None:
        department = self.get_or_404(session, department_id)
        if self._has_members(session, department_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot delete a department with assigned students or faculty",
            )
        self.repository.delete(session, department)
        self._commit(session)

    @staticmethod
    def _has_members(session: Session, department_id: UUID) -> bool:
        has_students = session.scalar(
            select(exists().where(Student.department_id == department_id))
        )
        has_faculty = session.scalar(select(exists().where(Faculty.department_id == department_id)))
        return bool(has_students or has_faculty)

    @staticmethod
    def _commit(session: Session) -> None:
        try:
            session.commit()
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A department with the same code or name already exists",
            ) from error
