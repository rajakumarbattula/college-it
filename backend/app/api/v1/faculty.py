"""Faculty API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.faculty import FacultyCreate, FacultyListResponse, FacultyResponse, FacultyUpdate
from app.services.faculty import FacultyService

router = APIRouter(prefix="/faculty", tags=["faculty"])
service = FacultyService()


@router.post("", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
def create_faculty(
    faculty_data: FacultyCreate, session: Session = Depends(get_db_session)
) -> FacultyResponse:
    return service.create(session, faculty_data)


@router.get("", response_model=FacultyListResponse)
def list_faculty(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    name: str | None = Query(default=None, min_length=1, max_length=200),
    employee_number: str | None = Query(default=None, min_length=1, max_length=30),
    session: Session = Depends(get_db_session),
) -> FacultyListResponse:
    faculty_members, total = service.list(
        session,
        page=page,
        page_size=page_size,
        name=name,
        employee_number=employee_number,
    )
    return FacultyListResponse(items=faculty_members, page=page, page_size=page_size, total=total)


@router.get("/{faculty_id}", response_model=FacultyResponse)
def get_faculty(faculty_id: UUID, session: Session = Depends(get_db_session)) -> FacultyResponse:
    return service.get_or_404(session, faculty_id)


@router.put("/{faculty_id}", response_model=FacultyResponse)
def replace_faculty(
    faculty_id: UUID, faculty_data: FacultyUpdate, session: Session = Depends(get_db_session)
) -> FacultyResponse:
    return service.replace(session, faculty_id, faculty_data)


@router.delete("/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faculty(faculty_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete(session, faculty_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
