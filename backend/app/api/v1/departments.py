"""Department API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.department import (
    DepartmentCreate,
    DepartmentListResponse,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.services.department import DepartmentService

router = APIRouter(prefix="/departments", tags=["departments"])
service = DepartmentService()


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate, session: Session = Depends(get_db_session)
) -> DepartmentResponse:
    return service.create(session, department_data)


@router.get("", response_model=DepartmentListResponse)
def list_departments(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, min_length=1, max_length=150),
    session: Session = Depends(get_db_session),
) -> DepartmentListResponse:
    departments, total = service.list(session, page=page, page_size=page_size, search=search)
    return DepartmentListResponse(items=departments, page=page, page_size=page_size, total=total)


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: UUID, session: Session = Depends(get_db_session)
) -> DepartmentResponse:
    return service.get_or_404(session, department_id)


@router.put("/{department_id}", response_model=DepartmentResponse)
def replace_department(
    department_id: UUID,
    department_data: DepartmentUpdate,
    session: Session = Depends(get_db_session),
) -> DepartmentResponse:
    return service.replace(session, department_id, department_data)


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(department_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete(session, department_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
