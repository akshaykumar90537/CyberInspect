from fastapi import APIRouter
from app.api.v1 import auth, scans, ai_chat, reports, admin

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(scans.router)
router.include_router(ai_chat.router)
router.include_router(reports.router)
router.include_router(admin.router)
