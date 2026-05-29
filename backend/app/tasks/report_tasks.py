"""Celery task: generate a PDF report for a completed scan."""
from app.core.celery_app import celery_app


@celery_app.task(name="app.tasks.report_tasks.generate_report")
def generate_report_task(scan_id: str, user_id: str):
    """Trigger PDF report generation for a scan."""
    import asyncio
    from app.core.database import AsyncSessionLocal
    from app.services.report_service import generate_pdf_report

    async def _run():
        async with AsyncSessionLocal() as db:
            await generate_pdf_report(db, scan_id, user_id)

    asyncio.run(_run())
