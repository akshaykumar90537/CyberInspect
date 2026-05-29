"""Admin-only endpoints for user management, system stats, and audit logs."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.scan import Scan, ScanLog

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """System-wide statistics for the admin dashboard."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    total_scans = (await db.execute(select(func.count(Scan.id)))).scalar_one()
    
    day_ago = datetime.now(timezone.utc) - timedelta(days=1)
    active_today = (await db.execute(
        select(func.count(Scan.id)).where(Scan.created_at >= day_ago)
    )).scalar_one()

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "active_today": active_today,
    }


@router.get("/users")
async def list_users(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).order_by(desc(User.created_at)).offset(skip).limit(limit)
    )
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        user.role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    await db.commit()
    return {"message": f"Role updated to {role}"}


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}
