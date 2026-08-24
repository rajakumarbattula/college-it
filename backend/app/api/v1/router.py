"""Version 1 API router.

Feature routers are registered here as they are implemented.
"""

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(prefix=get_settings().api_v1_prefix)
