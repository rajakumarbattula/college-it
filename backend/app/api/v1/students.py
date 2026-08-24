"""Student API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db_session
from app.schemas.student import StudentCreate, StudentListResponse, StudentResponse, StudentUpdate
from app.services.student import StudentService

router = APIRouter(prefix="/students", tags=["students"], dependencies=[Depends(get_current_user)])
service = StudentService()


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_data: StudentCreate, session: Session = Depends(get_db_session)
) -> StudentResponse:
    return service.create(session, student_data)


@router.get("", response_model=StudentListResponse)
def list_students(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    name: str | None = Query(default=None, min_length=1, max_length=200),
    student_number: str | None = Query(default=None, min_length=1, max_length=30),
    session: Session = Depends(get_db_session),
) -> StudentListResponse:
    students, total = service.list(
        session,
        page=page,
        page_size=page_size,
        name=name,
        student_number=student_number,
    )
    return StudentListResponse(items=students, page=page, page_size=page_size, total=total)


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: UUID, session: Session = Depends(get_db_session)) -> StudentResponse:
    return service.get_or_404(session, student_id)


@router.put("/{student_id}", response_model=StudentResponse)
def replace_student(
    student_id: UUID, student_data: StudentUpdate, session: Session = Depends(get_db_session)
) -> StudentResponse:
    return service.replace(session, student_id, student_data)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete(session, student_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
