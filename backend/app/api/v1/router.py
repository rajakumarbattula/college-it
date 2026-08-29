"""Version 1 API router.

Feature routers are registered here as they are implemented.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.departments import router as departments_router
from app.api.v1.faculty import router as faculty_router
from app.api.v1.students import router as students_router
from app.api.v1.users import router as users_router
from app.core.config import get_settings

router = APIRouter(prefix=get_settings().api_v1_prefix)
router.include_router(auth_router)
router.include_router(departments_router)
router.include_router(dashboard_router)
router.include_router(faculty_router)
router.include_router(students_router)
router.include_router(users_router)
