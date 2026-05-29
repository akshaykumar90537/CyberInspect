"""
Celery task: run a vulnerability scan in the background.
Called by the /scans/ POST endpoint.
"""
from app.core.celery_app import celery_app


@celery_app.task(bind=True, name="app.tasks.scan_tasks.run_scan", max_retries=2)
def run_scan_task(self, scan_id: str, target_url: str, scan_type: str = "full"):
    """Execute a CyberInspect scan as a Celery background task."""
    import asyncio
    from app.core.database import AsyncSessionLocal
    from app.models.scan import Scan, Vulnerability, ScanLog, ScanStatus
    from app.services.scanner import CyberInspectScanner, calculate_security_grade
    from sqlalchemy import select
    from datetime import datetime, timezone

    async def _run():
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Scan).where(Scan.id == scan_id))
            scan = result.scalar_one_or_none()
            if not scan:
                return

            scan.status = ScanStatus.RUNNING
            scan.started_at = datetime.now(timezone.utc)
            await db.commit()

            async def log_cb(message: str, level: str = "info"):
                log = ScanLog(scan_id=scan_id, message=message, level=level)
                db.add(log)
                await db.commit()

            try:
                scanner = CyberInspectScanner(target_url, scan_type)
                scanner.set_log_callback(log_cb)
                findings = await scanner.run()

                for f in findings:
                    vuln = Vulnerability(scan_id=scan_id, **f.to_dict())
                    db.add(vuln)

                grade, trust_score, threat_level = calculate_security_grade(findings)

                scan.status = ScanStatus.COMPLETED
                scan.completed_at = datetime.now(timezone.utc)
                scan.progress = 100
                scan.total_vulnerabilities = len(findings)
                scan.critical_count = sum(1 for f in findings if f.severity.value == "critical")
                scan.high_count = sum(1 for f in findings if f.severity.value == "high")
                scan.medium_count = sum(1 for f in findings if f.severity.value == "medium")
                scan.low_count = sum(1 for f in findings if f.severity.value == "low")
                scan.info_count = sum(1 for f in findings if f.severity.value == "info")
                scan.security_grade = grade
                scan.trust_score = trust_score
                scan.threat_level = threat_level
                scan.risk_score = round((100 - trust_score) / 10, 1)
                await db.commit()
            except Exception as e:
                scan.status = ScanStatus.FAILED
                await db.commit()
                raise self.retry(exc=e, countdown=5)

    asyncio.run(_run())
