"""Report model for generated PDF/HTML security reports."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    file_size: Mapped[int | None] = mapped_column(nullable=True)
    
    executive_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    user: Mapped["User"] = relationship("User", back_populates="reports")
    scan: Mapped["Scan"] = relationship("Scan", back_populates="report")
