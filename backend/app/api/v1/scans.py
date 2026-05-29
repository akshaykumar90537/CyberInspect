"""Scan management endpoints."""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.scan import Scan, Vulnerability, ScanLog, ScanStatus
from app.schemas.scan import CreateScanRequest, ScanResponse
from app.services.scanner import CyberInspectScanner, calculate_security_grade
from datetime import datetime, timezone

router = APIRouter(prefix="/scans", tags=["scans"])


async def _run_scan(scan_id: str, target_url: str, scan_type: str):
    """Background task: execute scan and persist results."""
    from app.core.database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        # Mark scan as running
        result = await db.execute(select(Scan).where(Scan.id == scan_id))
        scan = result.scalar_one_or_none()
        if not scan:
            return
        
        scan.status = ScanStatus.RUNNING
        scan.started_at = datetime.now(timezone.utc)
        await db.commit()
        
        logs = []
        
        async def log_callback(message: str, level: str = "info"):
            log = ScanLog(scan_id=scan_id, message=message, level=level)
            db.add(log)
            await db.commit()
        
        try:
            scanner = CyberInspectScanner(target_url, scan_type)
            scanner.set_log_callback(log_callback)
            findings = await scanner.run()
            
            # Persist vulnerabilities
            for i, finding in enumerate(findings):
                vuln = Vulnerability(
                    scan_id=scan_id,
                    **finding.to_dict(),
                )
                db.add(vuln)
            
            await db.flush()
            
            # Calculate scores
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
            scan.risk_score = (100 - trust_score) / 10
            
            await db.commit()
            
        except Exception as e:
            scan.status = ScanStatus.FAILED
            await db.commit()
            await log_callback(f"Scan failed: {str(e)}", "error")


@router.post("/", response_model=ScanResponse, status_code=201)
async def create_scan(
    data: CreateScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    from urllib.parse import urlparse
    domain = urlparse(data.target_url).netloc
    
    scan = Scan(
        user_id=uuid.uuid4(),  # In production: from JWT token
        target_url=data.target_url,
        target_domain=domain,
        scan_type=data.scan_type,
        scan_options=data.options,
    )
    db.add(scan)
    await db.flush()
    
    background_tasks.add_task(_run_scan, str(scan.id), data.target_url, data.scan_type)
    
    return scan


@router.get("/", response_model=list[ScanResponse])
async def list_scans(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Scan).order_by(desc(Scan.created_at)).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.delete("/{scan_id}", status_code=204)
async def delete_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    await db.delete(scan)
