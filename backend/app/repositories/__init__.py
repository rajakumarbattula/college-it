"""Persistence repositories."""

from app.repositories.department import DepartmentRepository
from app.repositories.faculty import FacultyRepository
from app.repositories.student import StudentRepository
from app.repositories.user import UserRepository

__all__ = ["DepartmentRepository", "FacultyRepository", "StudentRepository", "UserRepository"]
