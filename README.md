# CyberInspect AI — Intelligent Web Application Vulnerability Scanner

A **production-grade, AI-powered cybersecurity SaaS platform** for scanning web applications,
detecting vulnerabilities, and generating detailed security reports with remediation guidance.

## Features
- AI-Powered Vulnerability Detection (SQLi, XSS, CSRF, SSRF, TLS, Headers, etc.)
- Real-Time WebSocket scanning with live terminal logs
- AI Security Assistant (explains vulns, gives remediation guidance)
- Glassmorphism cyberpunk dashboard with animated charts + threat globe
- PDF Report generation with CVSS scoring
- JWT + Google OAuth authentication
- Admin Panel with user/scan/system analytics
- Local environment deployment and setup

## Quick Start

1. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in any required variables.
   
2. **Run Automatic Setup**:
   * **Windows (PowerShell)**:
     ```powershell
     .\setup.ps1
     ```
   * **macOS / Linux (Bash)**:
     ```bash
     chmod +x setup.sh
     ./setup.sh
     ```

3. **Run Application**:
   * **Backend**:
     ```bash
     cd backend
     # Windows:
     .\venv\Scripts\activate
     # macOS/Linux:
     source venv/bin/activate
     
     # Start FastAPI server
     uvicorn app.main:app --reload --port 8000
     ```
   * **Frontend**:
     ```bash
     cd frontend
     npm run dev
     ```

For a detailed step-by-step setup guide including installing local PostgreSQL and Redis databases, see [LOCAL_SETUP.md](LOCAL_SETUP.md).

## Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion, ShadCN UI, Recharts
- **Backend**: Python FastAPI, SQLAlchemy, Pydantic, Celery
- **Database**: PostgreSQL 16, Redis 7
- **Scanning**: OWASP ZAP, Nmap, Nikto, custom crawlers
- **Auth**: JWT, Google OAuth 2.0, bcrypt

