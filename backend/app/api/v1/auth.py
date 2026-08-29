"""Authentication endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RegistrationRequest,
    RegistrationResponse,
)
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])
service = AuthService()


@router.post("/login", response_model=AccessTokenResponse)
def login(
    credentials: LoginRequest, session: Session = Depends(get_db_session)
) -> AccessTokenResponse:
    access_token, expires_in = service.login(session, credentials)
    return AccessTokenResponse(access_token=access_token, expires_in=expires_in)


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register(
    registration: RegistrationRequest, session: Session = Depends(get_db_session)
) -> RegistrationResponse:
    return service.register(session, registration)
