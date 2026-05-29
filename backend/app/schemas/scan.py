from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class CreateScanRequest(BaseModel):
    target_url: str
    scan_type: str = "full"
    options: dict = {}

    @field_validator("target_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v.rstrip("/")

class VulnerabilityResponse(BaseModel):
    id: str
    name: str
    category: str
    severity: str
    description: str
    affected_url: Optional[str] = None
    cvss_score: Optional[float] = None
    remediation: Optional[str] = None
    exploit_probability: Optional[float] = None
    is_false_positive: bool = False
    model_config = {"from_attributes": True}

class ScanResponse(BaseModel):
    id: str
    target_url: str
    scan_type: str
    status: str
    progress: int
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    security_grade: Optional[str] = None
    trust_score: Optional[int] = None
    threat_level: Optional[str] = None
    technologies: list = []
    created_at: datetime
    completed_at: Optional[datetime] = None
    vulnerabilities: list[VulnerabilityResponse] = []
    model_config = {"from_attributes": True}
