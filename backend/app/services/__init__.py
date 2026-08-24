"""Application business services."""

from app.services.department import DepartmentService
from app.services.faculty import FacultyService
from app.services.student import StudentService

__all__ = ["DepartmentService", "FacultyService", "StudentService"]
