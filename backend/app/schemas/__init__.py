"""Pydantic request and response schemas."""

from app.schemas.department import (
    DepartmentCreate,
    DepartmentListResponse,
    DepartmentResponse,
    DepartmentUpdate,
)
from app.schemas.faculty import FacultyCreate, FacultyListResponse, FacultyResponse, FacultyUpdate
from app.schemas.student import StudentCreate, StudentListResponse, StudentResponse, StudentUpdate
from app.schemas.user import UserCreate, UserListResponse, UserResponse, UserUpdate

__all__ = [
    "DepartmentCreate",
    "DepartmentListResponse",
    "DepartmentResponse",
    "DepartmentUpdate",
    "FacultyCreate",
    "FacultyListResponse",
    "FacultyResponse",
    "FacultyUpdate",
    "StudentCreate",
    "StudentListResponse",
    "StudentResponse",
    "StudentUpdate",
    "UserCreate",
    "UserListResponse",
    "UserResponse",
    "UserUpdate",
]
