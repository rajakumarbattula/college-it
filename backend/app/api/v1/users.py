"""Administrator-only user management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_roles
from app.db.session import get_db_session
from app.models.user import UserRole
from app.schemas.user import UserCreate, UserListResponse, UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)
service = UserService()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, session: Session = Depends(get_db_session)) -> UserResponse:
    return service.create(session, user_data)


@router.get("", response_model=UserListResponse)
def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    session: Session = Depends(get_db_session),
) -> UserListResponse:
    users, total = service.list(session, page=page, page_size=page_size)
    return UserListResponse(items=users, page=page, page_size=page_size, total=total)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: UUID, session: Session = Depends(get_db_session)) -> UserResponse:
    return service.get_or_404(session, user_id)


@router.patch("/{user_id}", response_model=UserResponse)
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID, user_data: UserUpdate, session: Session = Depends(get_db_session)
) -> UserResponse:
    return service.update(session, user_id, user_data)
