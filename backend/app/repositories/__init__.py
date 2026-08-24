"""Persistence repositories."""

from app.repositories.department import DepartmentRepository
from app.repositories.student import StudentRepository

__all__ = ["DepartmentRepository", "StudentRepository"]
