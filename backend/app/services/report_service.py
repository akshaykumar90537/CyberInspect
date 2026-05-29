"""
PDF report generation service using ReportLab.
Generates professional security assessment PDFs with cover page,
executive summary, vulnerability table, and remediation section.
"""
import uuid
import os
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.scan import Scan, Vulnerability, VulnSeverity
from app.models.report import Report
from app.services.ai_service import generate_executive_summary

REPORTS_DIR = Path("/app/reports")
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

SEVERITY_COLORS_HEX = {
    VulnSeverity.CRITICAL: (0.97, 0.24, 0.35),
    VulnSeverity.HIGH:     (0.98, 0.55, 0.26),
    VulnSeverity.MEDIUM:   (1.0,  0.72, 0.0),
    VulnSeverity.LOW:      (0.0,  0.83, 1.0),
    VulnSeverity.INFO:     (0.54, 0.36, 0.96),
}


async def generate_pdf_report(db: AsyncSession, scan_id: str, user_id: str) -> Report:
    """Generate a PDF security report for a completed scan."""
    # Load scan + vulnerabilities
    result = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = result.scalar_one_or_none()
    if not scan:
        raise ValueError(f"Scan {scan_id} not found")

    vuln_result = await db.execute(
        select(Vulnerability).where(Vulnerability.scan_id == scan_id)
        .order_by(Vulnerability.cvss_score.desc().nullslast())
    )
    vulns = vuln_result.scalars().all()

    # Generate executive summary via AI
    summary = await generate_executive_summary({
        "target_url": scan.target_url,
        "security_grade": scan.security_grade,
        "trust_score": scan.trust_score,
        "total_vulnerabilities": scan.total_vulnerabilities,
        "critical_count": scan.critical_count,
        "high_count": scan.high_count,
        "medium_count": scan.medium_count,
        "technologies": scan.technologies,
    })

    # Build PDF
    filename = f"cyberinspect_report_{scan_id[:8]}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = REPORTS_DIR / filename

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        doc = SimpleDocTemplate(str(filepath), pagesize=A4,
                                leftMargin=2*cm, rightMargin=2*cm,
                                topMargin=2*cm, bottomMargin=2*cm)

        styles = getSampleStyleSheet()
        story = []

        # Cover
        title_style = ParagraphStyle("Title", parent=styles["Title"],
                                     fontSize=28, textColor=colors.HexColor("#00d4ff"),
                                     spaceAfter=12, alignment=TA_CENTER)
        sub_style = ParagraphStyle("Sub", parent=styles["Normal"],
                                   fontSize=12, textColor=colors.HexColor("#94a3b8"),
                                   alignment=TA_CENTER)

        story.append(Spacer(1, 1.5*cm))
        story.append(Paragraph("CyberInspect AI", title_style))
        story.append(Paragraph("Security Assessment Report", sub_style))
        story.append(Spacer(1, 0.5*cm))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1a2a45")))
        story.append(Spacer(1, 0.5*cm))

        # Meta table
        meta = [
            ["Target", scan.target_url],
            ["Scan Type", scan.scan_type.upper()],
            ["Security Grade", scan.security_grade or "N/A"],
            ["Trust Score", f"{scan.trust_score or 0}/100"],
            ["Threat Level", (scan.threat_level or "").upper()],
            ["Scan Date", scan.completed_at.strftime("%Y-%m-%d %H:%M UTC") if scan.completed_at else "N/A"],
            ["Total Findings", str(scan.total_vulnerabilities)],
        ]
        meta_table = Table(meta, colWidths=[4*cm, 12*cm])
        meta_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#64748b")),
            ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#e2e8f0")),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0b1120")),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.HexColor("#0b1120"), colors.HexColor("#0f1929")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#1a2a45")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 1*cm))

        # Executive Summary
        h2 = ParagraphStyle("H2", parent=styles["Heading2"],
                             textColor=colors.HexColor("#00d4ff"), fontSize=14, spaceAfter=8)
        body = ParagraphStyle("Body", parent=styles["Normal"],
                              textColor=colors.HexColor("#94a3b8"), fontSize=10,
                              leading=16, spaceAfter=6)
        story.append(Paragraph("Executive Summary", h2))
        for para in summary.split("\n"):
            if para.strip():
                story.append(Paragraph(para, body))
        story.append(Spacer(1, 0.8*cm))

        # Vulnerability table
        if vulns:
            story.append(Paragraph("Vulnerability Findings", h2))
            vuln_data = [["#", "Vulnerability", "Severity", "CVSS", "URL"]]
            for i, v in enumerate(vulns[:50], 1):  # cap at 50 rows
                url = (v.affected_url or "")[:60] + ("..." if len(v.affected_url or "") > 60 else "")
                vuln_data.append([str(i), v.name, v.severity.value.upper(),
                                  f"{v.cvss_score:.1f}" if v.cvss_score else "N/A", url])

            vt = Table(vuln_data, colWidths=[0.8*cm, 6*cm, 2.5*cm, 1.5*cm, 6.5*cm])
            ts = TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0b1120")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#00d4ff")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#cbd5e1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0b1120"), colors.HexColor("#0f1929")]),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#1a2a45")),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ])
            # Color-code severity cells
            for i, v in enumerate(vulns[:50], 1):
                c = SEVERITY_COLORS_HEX.get(v.severity, (0.5, 0.5, 0.5))
                ts.add("TEXTCOLOR", (2, i), (2, i), colors.Color(*c))
            vt.setStyle(ts)
            story.append(vt)

        doc.build(story)
    except ImportError:
        # ReportLab not installed — write a text placeholder
        with open(filepath, "w") as f:
            f.write(f"CyberInspect AI Security Report\nTarget: {scan.target_url}\n")
            f.write(f"Grade: {scan.security_grade} | Score: {scan.trust_score}/100\n")
            f.write(f"Total Findings: {scan.total_vulnerabilities}\n\n{summary}")

    file_size = os.path.getsize(filepath) if filepath.exists() else 0

    # Persist report record
    report = Report(
        user_id=user_id,
        scan_id=scan_id,
        title=f"Security Report — {scan.target_domain or scan.target_url}",
        file_path=str(filepath),
        file_size=file_size,
        executive_summary=summary,
    )
    db.add(report)
    await db.commit()
    return report
