"""Report generation and download endpoints."""
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.report import Report
from app.models.scan import Scan, ScanStatus

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/")
async def list_reports(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report).order_by(desc(Report.created_at)).offset(skip).limit(limit)
    )
    reports = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "scan_id": str(r.scan_id),
            "file_size": r.file_size,
            "created_at": r.created_at.isoformat(),
            "executive_summary": r.executive_summary,
        }
        for r in reports
    ]


@router.post("/{scan_id}/generate", status_code=202)
async def generate_report(
    scan_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan.status != ScanStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Scan must be completed before generating a report")

    from app.services.report_service import generate_pdf_report
    import uuid
    background_tasks.add_task(generate_pdf_report, db, scan_id, str(uuid.uuid4()))
    return {"message": "Report generation started", "scan_id": scan_id}


@router.get("/{report_id}/download")
async def download_report(report_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if not report.file_path or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk")
    return FileResponse(
        path=report.file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.file_path),
    )


@router.delete("/{report_id}", status_code=204)
async def delete_report(report_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.file_path and os.path.exists(report.file_path):
        os.remove(report.file_path)
    await db.delete(report)
