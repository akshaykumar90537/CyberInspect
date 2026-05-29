"""
Scan, Vulnerability, and ScanLog models.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.core.database import Base


class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VulnSeverity(str, enum.Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Target
    target_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    target_domain: Mapped[str] = mapped_column(String(255), nullable=True)
    target_ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    
    # Scan config
    scan_type: Mapped[str] = mapped_column(String(50), default="full")  # quick, full, deep
    scan_options: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Status
    status: Mapped[ScanStatus] = mapped_column(SAEnum(ScanStatus), default=ScanStatus.PENDING, index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)  # 0-100
    celery_task_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Results summary
    total_vulnerabilities: Mapped[int] = mapped_column(Integer, default=0)
    critical_count: Mapped[int] = mapped_column(Integer, default=0)
    high_count: Mapped[int] = mapped_column(Integer, default=0)
    medium_count: Mapped[int] = mapped_column(Integer, default=0)
    low_count: Mapped[int] = mapped_column(Integer, default=0)
    info_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # AI Scoring
    security_grade: Mapped[str | None] = mapped_column(String(2), nullable=True)  # A-F
    trust_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0-100
    threat_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Tech detection
    technologies: Mapped[list] = mapped_column(JSON, default=list)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="scans")
    vulnerabilities: Mapped[list["Vulnerability"]] = relationship("Vulnerability", back_populates="scan", cascade="all, delete-orphan")
    logs: Mapped[list["ScanLog"]] = relationship("ScanLog", back_populates="scan", cascade="all, delete-orphan")
    report: Mapped[Optional["Report"]] = relationship("Report", back_populates="scan", uselist=False)


class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    
    # Vulnerability info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # xss, sqli, headers, etc.
    severity: Mapped[VulnSeverity] = mapped_column(SAEnum(VulnSeverity), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Location
    affected_url: Mapped[str] = mapped_column(String(2048), nullable=True)
    parameter: Mapped[str | None] = mapped_column(String(255), nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Scoring
    cvss_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cvss_vector: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cve_id: Mapped[str | None] = mapped_column(String(20), nullable=True)
    
    # AI analysis
    risk_analysis: Mapped[str | None] = mapped_column(Text, nullable=True)
    remediation: Mapped[str | None] = mapped_column(Text, nullable=True)
    exploit_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    # Meta
    is_false_positive: Mapped[bool] = mapped_column(Boolean, default=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    scan: Mapped["Scan"] = relationship("Scan", back_populates="vulnerabilities")


class ScanLog(Base):
    __tablename__ = "scan_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    
    level: Mapped[str] = mapped_column(String(20), default="info")  # info, warning, error, success
    message: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    
    scan: Mapped["Scan"] = relationship("Scan", back_populates="logs")
