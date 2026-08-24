"""Business operations for faculty."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.faculty import Faculty
from app.repositories.faculty import FacultyRepository
from app.schemas.faculty import FacultyCreate, FacultyUpdate


class FacultyService:
    """Coordinate faculty validation and persistence."""

    def __init__(self, repository: FacultyRepository | None = None) -> None:
        self.repository = repository or FacultyRepository()

    def create(self, session: Session, faculty_data: FacultyCreate) -> Faculty:
        self._ensure_department_exists(session, faculty_data.department_id)
        faculty_member = Faculty(**faculty_data.model_dump())
        self.repository.add(session, faculty_member)
        self._commit(session)
        session.refresh(faculty_member)
        return faculty_member

    def get_or_404(self, session: Session, faculty_id: UUID) -> Faculty:
        faculty_member = self.repository.get(session, faculty_id)
        if faculty_member is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found"
            )
        return faculty_member

    def list(
        self,
        session: Session,
        *,
        page: int,
        page_size: int,
        name: str | None,
        employee_number: str | None,
    ) -> tuple[list[Faculty], int]:
        return self.repository.list(
            session,
            page=page,
            page_size=page_size,
            name=name,
            employee_number=employee_number,
        )

    def replace(self, session: Session, faculty_id: UUID, faculty_data: FacultyUpdate) -> Faculty:
        faculty_member = self.get_or_404(session, faculty_id)
        self._ensure_department_exists(session, faculty_data.department_id)
        for field_name, value in faculty_data.model_dump().items():
            setattr(faculty_member, field_name, value)
        self._commit(session)
        session.refresh(faculty_member)
        return faculty_member

    def delete(self, session: Session, faculty_id: UUID) -> None:
        faculty_member = self.get_or_404(session, faculty_id)
        self.repository.delete(session, faculty_member)
        self._commit(session)

    @staticmethod
    def _ensure_department_exists(session: Session, department_id: UUID) -> None:
        if session.get(Department, department_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )

    @staticmethod
    def _commit(session: Session) -> None:
        try:
            session.commit()
        except IntegrityError as error:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A faculty member with the same employee number or email already exists",
            ) from error
