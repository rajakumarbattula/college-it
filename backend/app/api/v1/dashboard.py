"""Dashboard aggregation and privileged content management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_roles
from app.db.session import get_db_session
from app.models.user import UserRole
from app.schemas.dashboard import (
    AchievementCreate,
    AchievementResponse,
    AchievementUpdate,
    DashboardResponse,
    EventCreate,
    EventResponse,
    EventUpdate,
    GalleryCreate,
    GalleryResponse,
    GalleryUpdate,
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
)
from app.services.dashboard import DashboardService

router = APIRouter(
    prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)]
)
service = DashboardService()
privileged = [Depends(require_roles(UserRole.ADMIN, UserRole.FACULTY, UserRole.STAFF))]


@router.get("", response_model=DashboardResponse)
def get_dashboard(session: Session = Depends(get_db_session)) -> DashboardResponse:
    return service.dashboard(session)


@router.get("/achievements", response_model=list[AchievementResponse], dependencies=privileged)
def list_achievements(session: Session = Depends(get_db_session)) -> list[AchievementResponse]:
    return service.list_achievements(session)


@router.post(
    "/achievements",
    response_model=AchievementResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=privileged,
)
def create_achievement(
    data: AchievementCreate, session: Session = Depends(get_db_session)
) -> AchievementResponse:
    return service.create_achievement(session, data)


@router.put("/achievements/{item_id}", response_model=AchievementResponse, dependencies=privileged)
def update_achievement(
    item_id: UUID, data: AchievementUpdate, session: Session = Depends(get_db_session)
) -> AchievementResponse:
    return service.update_achievement(session, item_id, data)


@router.delete(
    "/achievements/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=privileged
)
def delete_achievement(item_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete_achievement(session, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/events", response_model=list[EventResponse], dependencies=privileged)
def list_events(session: Session = Depends(get_db_session)) -> list[EventResponse]:
    return service.list_events(session)


@router.post(
    "/events",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=privileged,
)
def create_event(data: EventCreate, session: Session = Depends(get_db_session)) -> EventResponse:
    return service.create_event(session, data)


@router.put("/events/{item_id}", response_model=EventResponse, dependencies=privileged)
def update_event(
    item_id: UUID, data: EventUpdate, session: Session = Depends(get_db_session)
) -> EventResponse:
    return service.update_event(session, item_id, data)


@router.delete("/events/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=privileged)
def delete_event(item_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete_event(session, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/notifications", response_model=list[NotificationResponse], dependencies=privileged)
def list_notifications(session: Session = Depends(get_db_session)) -> list[NotificationResponse]:
    return service.list_notifications(session)


@router.post(
    "/notifications",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=privileged,
)
def create_notification(
    data: NotificationCreate, session: Session = Depends(get_db_session)
) -> NotificationResponse:
    return service.create_notification(session, data)


@router.put(
    "/notifications/{item_id}", response_model=NotificationResponse, dependencies=privileged
)
def update_notification(
    item_id: UUID, data: NotificationUpdate, session: Session = Depends(get_db_session)
) -> NotificationResponse:
    return service.update_notification(session, item_id, data)


@router.delete(
    "/notifications/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=privileged
)
def delete_notification(item_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete_notification(session, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/gallery", response_model=list[GalleryResponse], dependencies=privileged)
def list_gallery(session: Session = Depends(get_db_session)) -> list[GalleryResponse]:
    return service.list_gallery_photos(session)


@router.post(
    "/gallery",
    response_model=GalleryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=privileged,
)
def create_gallery_photo(
    data: GalleryCreate, session: Session = Depends(get_db_session)
) -> GalleryResponse:
    return service.create_gallery_photo(session, data)


@router.put("/gallery/{item_id}", response_model=GalleryResponse, dependencies=privileged)
def update_gallery_photo(
    item_id: UUID, data: GalleryUpdate, session: Session = Depends(get_db_session)
) -> GalleryResponse:
    return service.update_gallery_photo(session, item_id, data)


@router.delete(
    "/gallery/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=privileged
)
def delete_gallery_photo(item_id: UUID, session: Session = Depends(get_db_session)) -> Response:
    service.delete_gallery_photo(session, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
