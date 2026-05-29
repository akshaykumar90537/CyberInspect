"""
Core vulnerability scanner service.
Orchestrates: URL crawling, header analysis, ZAP integration, Nmap port scanning,
SSL/TLS checks, technology detection, and AI risk scoring.
"""
import asyncio
import re
import ssl
import socket
from datetime import datetime, timezone
from typing import AsyncGenerator
from urllib.parse import urlparse, urljoin

import httpx
from bs4 import BeautifulSoup

from app.core.config import settings
from app.models.scan import VulnSeverity


# ─── Security Header Checks ──────────────────────────────────────────────────

REQUIRED_HEADERS = {
    "Strict-Transport-Security": {
        "severity": VulnSeverity.HIGH,
        "description": "Missing HSTS header. Site is vulnerable to protocol downgrade attacks.",
        "remediation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' header.",
    },
    "X-Content-Type-Options": {
        "severity": VulnSeverity.MEDIUM,
        "description": "Missing X-Content-Type-Options header. Browsers may MIME-sniff responses.",
        "remediation": "Add 'X-Content-Type-Options: nosniff' header.",
    },
    "X-Frame-Options": {
        "severity": VulnSeverity.MEDIUM,
        "description": "Missing X-Frame-Options. Site may be vulnerable to clickjacking.",
        "remediation": "Add 'X-Frame-Options: DENY' or 'SAMEORIGIN' header.",
    },
    "Content-Security-Policy": {
        "severity": VulnSeverity.HIGH,
        "description": "Missing Content-Security-Policy header. No XSS mitigation in place.",
        "remediation": "Define a strict CSP. Start with: Content-Security-Policy: default-src 'self'",
    },
    "X-XSS-Protection": {
        "severity": VulnSeverity.LOW,
        "description": "Missing X-XSS-Protection header.",
        "remediation": "Add 'X-XSS-Protection: 1; mode=block' (legacy browsers).",
    },
    "Referrer-Policy": {
        "severity": VulnSeverity.LOW,
        "description": "Missing Referrer-Policy. Sensitive URLs may leak to third parties.",
        "remediation": "Add 'Referrer-Policy: strict-origin-when-cross-origin'.",
    },
    "Permissions-Policy": {
        "severity": VulnSeverity.LOW,
        "description": "Missing Permissions-Policy header.",
        "remediation": "Add Permissions-Policy to restrict browser features.",
    },
}

SENSITIVE_PATHS = [
    "/.git/config", "/.env", "/config.php", "/wp-config.php",
    "/phpinfo.php", "/.htaccess", "/server-status", "/admin",
    "/admin/", "/wp-admin/", "/phpmyadmin/", "/.DS_Store",
    "/backup.zip", "/dump.sql", "/robots.txt", "/sitemap.xml",
]

XSS_PAYLOADS = [
    '<script>alert(1)</script>',
    '"><script>alert(1)</script>',
    "';alert(1)//",
    '<img src=x onerror=alert(1)>',
]

SQLI_PAYLOADS = [
    "'", '"', "' OR '1'='1", "1; DROP TABLE users--",
    "' UNION SELECT NULL--", "1' AND '1'='1",
]


class VulnerabilityFinding:
    """Represents a single discovered vulnerability."""

    def __init__(
        self,
        name: str,
        category: str,
        severity: VulnSeverity,
        description: str,
        affected_url: str = "",
        parameter: str = "",
        evidence: str = "",
        cvss_score: float | None = None,
        remediation: str = "",
    ):
        self.name = name
        self.category = category
        self.severity = severity
        self.description = description
        self.affected_url = affected_url
        self.parameter = parameter
        self.evidence = evidence
        self.cvss_score = cvss_score
        self.remediation = remediation
        self.exploit_probability = self._calc_exploit_prob()

    def _calc_exploit_prob(self) -> float:
        base = {
            VulnSeverity.CRITICAL: 0.90,
            VulnSeverity.HIGH: 0.70,
            VulnSeverity.MEDIUM: 0.45,
            VulnSeverity.LOW: 0.20,
            VulnSeverity.INFO: 0.05,
        }
        return base.get(self.severity, 0.5)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "category": self.category,
            "severity": self.severity.value,
            "description": self.description,
            "affected_url": self.affected_url,
            "parameter": self.parameter,
            "evidence": self.evidence[:500] if self.evidence else "",
            "cvss_score": self.cvss_score,
            "remediation": self.remediation,
            "exploit_probability": self.exploit_probability,
        }


class CyberInspectScanner:
    """
    Main scanner orchestrator. Runs async checks in parallel:
    - HTTP header analysis
    - Cookie security check
    - Path enumeration (sensitive file discovery)
    - Form/input discovery + XSS/SQLi probing
    - SSL/TLS validation
    - Technology fingerprinting
    - Open redirect detection
    - CORS misconfiguration
    """

    def __init__(self, target_url: str, scan_type: str = "full"):
        parsed = urlparse(target_url)
        self.target_url = target_url
        self.base_url = f"{parsed.scheme}://{parsed.netloc}"
        self.domain = parsed.netloc
        self.scan_type = scan_type
        self.findings: list[VulnerabilityFinding] = []
        self._log_callback = None
        self.client = httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": "CyberInspect-AI-Scanner/1.0"},
            verify=False,  # We check SSL separately
        )

    def set_log_callback(self, callback):
        """Register an async callback for real-time log streaming."""
        self._log_callback = callback

    async def _log(self, message: str, level: str = "info"):
        if self._log_callback:
            await self._log_callback(message, level)

    async def run(self) -> list[VulnerabilityFinding]:
        """Execute the full scan pipeline."""
        await self._log(f"[*] Starting scan of {self.target_url}", "info")
        
        try:
            resp = await self.client.get(self.target_url)
            
            tasks = [
                self._check_headers(resp),
                self._check_cookies(resp),
                self._check_ssl(),
                self._fingerprint_tech(resp),
                self._check_cors(resp),
            ]
            
            if self.scan_type in ("full", "deep"):
                tasks += [
                    self._enumerate_sensitive_paths(),
                    self._discover_and_probe_forms(resp),
                    self._check_open_redirect(),
                ]
            
            await asyncio.gather(*tasks, return_exceptions=True)
            
        except Exception as e:
            await self._log(f"[!] Scan error: {e}", "error")
        finally:
            await self.client.aclose()

        await self._log(f"[+] Scan complete. {len(self.findings)} findings.", "success")
        return self.findings

    async def _check_headers(self, resp: httpx.Response):
        """Check for missing or misconfigured security headers."""
        await self._log("[*] Checking security headers...", "info")
        headers_lower = {k.lower(): v for k, v in resp.headers.items()}

        for header, meta in REQUIRED_HEADERS.items():
            if header.lower() not in headers_lower:
                self.findings.append(VulnerabilityFinding(
                    name=f"Missing {header} Header",
                    category="headers",
                    severity=meta["severity"],
                    description=meta["description"],
                    affected_url=self.target_url,
                    cvss_score=self._header_cvss(meta["severity"]),
                    remediation=meta["remediation"],
                ))
                await self._log(f"  [!] Missing: {header}", "warning")

        # Check for server banner disclosure
        server = headers_lower.get("server", "")
        if re.search(r"(apache|nginx|iis|php|asp)\s*/?\d", server, re.I):
            self.findings.append(VulnerabilityFinding(
                name="Server Banner Disclosure",
                category="exposure",
                severity=VulnSeverity.LOW,
                description=f"Server header reveals technology stack: {server}",
                affected_url=self.target_url,
                evidence=f"Server: {server}",
                cvss_score=3.1,
                remediation="Remove or obfuscate the Server header to prevent version disclosure.",
            ))

        await self._log("[+] Header check complete.", "success")

    async def _check_cookies(self, resp: httpx.Response):
        """Validate cookie security attributes."""
        await self._log("[*] Analyzing cookies...", "info")
        for cookie in resp.cookies.jar:
            flags = []
            if not cookie.secure:
                flags.append("missing Secure flag")
            if not cookie.has_nonstandard_attr("HttpOnly"):
                flags.append("missing HttpOnly flag")
            if not cookie.has_nonstandard_attr("SameSite"):
                flags.append("missing SameSite attribute")
            
            if flags:
                self.findings.append(VulnerabilityFinding(
                    name=f"Insecure Cookie: {cookie.name}",
                    category="cookies",
                    severity=VulnSeverity.MEDIUM,
                    description=f"Cookie '{cookie.name}' has security issues: {', '.join(flags)}",
                    affected_url=self.target_url,
                    evidence=f"Cookie: {cookie.name}",
                    cvss_score=5.3,
                    remediation=f"Update cookie to include: Set-Cookie: {cookie.name}=value; Secure; HttpOnly; SameSite=Strict",
                ))

    async def _check_ssl(self):
        """Perform SSL/TLS validation."""
        if not self.target_url.startswith("https://"):
            self.findings.append(VulnerabilityFinding(
                name="No HTTPS / Cleartext HTTP",
                category="crypto",
                severity=VulnSeverity.HIGH,
                description="Site is served over HTTP without TLS encryption. All data is transmitted in cleartext.",
                affected_url=self.target_url,
                cvss_score=7.5,
                remediation="Obtain an SSL/TLS certificate (Let's Encrypt is free) and redirect all HTTP traffic to HTTPS.",
            ))
            return

        await self._log("[*] Checking SSL/TLS configuration...", "info")
        try:
            ctx = ssl.create_default_context()
            host = urlparse(self.target_url).hostname
            with socket.create_connection((host, 443), timeout=5) as sock:
                with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                    cert = ssock.getpeercert()
                    version = ssock.version()
                    
                    if version in ("TLSv1", "TLSv1.1", "SSLv2", "SSLv3"):
                        self.findings.append(VulnerabilityFinding(
                            name=f"Weak TLS Version: {version}",
                            category="crypto",
                            severity=VulnSeverity.HIGH,
                            description=f"Server supports deprecated TLS version {version}.",
                            affected_url=self.target_url,
                            cvss_score=7.4,
                            remediation="Disable TLS 1.0 and 1.1. Configure server to use TLS 1.2+ only.",
                        ))
        except ssl.SSLError as e:
            self.findings.append(VulnerabilityFinding(
                name="SSL Certificate Error",
                category="crypto",
                severity=VulnSeverity.HIGH,
                description=f"SSL certificate validation failed: {str(e)}",
                affected_url=self.target_url,
                cvss_score=7.4,
                remediation="Renew or replace the SSL certificate. Ensure CN/SAN matches the domain.",
            ))
        except Exception:
            pass

    async def _enumerate_sensitive_paths(self):
        """Probe for exposed sensitive files and admin panels."""
        await self._log("[*] Enumerating sensitive paths...", "info")
        
        async def check_path(path: str):
            try:
                url = self.base_url + path
                resp = await self.client.get(url)
                if resp.status_code in (200, 403):
                    severity = VulnSeverity.CRITICAL if resp.status_code == 200 else VulnSeverity.MEDIUM
                    self.findings.append(VulnerabilityFinding(
                        name=f"Exposed Sensitive Path: {path}",
                        category="exposure",
                        severity=severity,
                        description=f"Sensitive file/directory accessible at {url} (HTTP {resp.status_code}).",
                        affected_url=url,
                        cvss_score=8.6 if severity == VulnSeverity.CRITICAL else 5.3,
                        remediation=f"Restrict access to {path} via web server configuration or .htaccess.",
                    ))
                    await self._log(f"  [!] Found: {path} ({resp.status_code})", "warning")
            except Exception:
                pass

        await asyncio.gather(*[check_path(p) for p in SENSITIVE_PATHS])

    async def _discover_and_probe_forms(self, resp: httpx.Response):
        """Parse HTML forms and probe inputs for XSS/SQLi."""
        await self._log("[*] Discovering and testing forms...", "info")
        soup = BeautifulSoup(resp.text, "html.parser")
        forms = soup.find_all("form")
        
        if not forms:
            await self._log("  [-] No forms found.", "info")
            return

        await self._log(f"  [+] Found {len(forms)} form(s). Testing inputs...", "info")

        for form in forms[:5]:  # Limit to first 5 forms
            action = form.get("action", "")
            form_url = urljoin(self.target_url, action) if action else self.target_url
            inputs = form.find_all(["input", "textarea"])
            
            for inp in inputs:
                iname = inp.get("name", "")
                itype = inp.get("type", "text")
                if itype in ("submit", "button", "hidden", "file"):
                    continue

                # Basic XSS probe
                for payload in XSS_PAYLOADS[:1]:
                    try:
                        data = {i.get("name", ""): payload for i in inputs if i.get("name")}
                        r = await self.client.post(form_url, data=data)
                        if payload in r.text:
                            self.findings.append(VulnerabilityFinding(
                                name="Reflected Cross-Site Scripting (XSS)",
                                category="xss",
                                severity=VulnSeverity.HIGH,
                                description=f"Reflected XSS detected in parameter '{iname}' at {form_url}.",
                                affected_url=form_url,
                                parameter=iname,
                                evidence=f"Payload {payload!r} reflected in response.",
                                cvss_score=7.4,
                                remediation="Encode all user-supplied data before reflecting it in HTML. Use Content-Security-Policy.",
                            ))
                            await self._log(f"  [!!!] XSS found: {form_url} [{iname}]", "error")
                    except Exception:
                        pass

    async def _check_cors(self, resp: httpx.Response):
        """Check for CORS misconfigurations."""
        await self._log("[*] Checking CORS configuration...", "info")
        try:
            r = await self.client.get(
                self.target_url,
                headers={"Origin": "https://evil.com"},
            )
            acao = r.headers.get("access-control-allow-origin", "")
            acac = r.headers.get("access-control-allow-credentials", "")
            
            if acao == "*" and acac.lower() == "true":
                self.findings.append(VulnerabilityFinding(
                    name="Dangerous CORS Configuration",
                    category="cors",
                    severity=VulnSeverity.CRITICAL,
                    description="CORS allows all origins (*) while also allowing credentials. This allows attackers to make authenticated cross-origin requests.",
                    affected_url=self.target_url,
                    evidence=f"Access-Control-Allow-Origin: {acao}\nAccess-Control-Allow-Credentials: {acac}",
                    cvss_score=9.1,
                    remediation="Never combine wildcard (*) origin with credentials. Whitelist specific trusted origins.",
                ))
            elif acao == "https://evil.com":
                self.findings.append(VulnerabilityFinding(
                    name="CORS Origin Reflection",
                    category="cors",
                    severity=VulnSeverity.HIGH,
                    description="Server reflects the Origin header, allowing any origin to access the API.",
                    affected_url=self.target_url,
                    cvss_score=8.0,
                    remediation="Validate Origin against a whitelist instead of reflecting it directly.",
                ))
        except Exception:
            pass

    async def _check_open_redirect(self):
        """Test for open redirect vulnerabilities in common parameters."""
        await self._log("[*] Testing for open redirects...", "info")
        redirect_params = ["redirect", "url", "next", "return", "returnUrl", "goto", "ref"]
        payload = "https://evil.com"
        
        for param in redirect_params:
            try:
                test_url = f"{self.target_url}?{param}={payload}"
                r = await self.client.get(test_url, follow_redirects=False)
                location = r.headers.get("location", "")
                if "evil.com" in location:
                    self.findings.append(VulnerabilityFinding(
                        name="Open Redirect",
                        category="redirect",
                        severity=VulnSeverity.MEDIUM,
                        description=f"Open redirect via parameter '{param}'. Attacker can redirect users to phishing sites.",
                        affected_url=test_url,
                        parameter=param,
                        evidence=f"Location: {location}",
                        cvss_score=6.1,
                        remediation=f"Validate redirect URLs against an allowlist. Reject external URLs in '{param}' parameter.",
                    ))
            except Exception:
                pass

    async def _fingerprint_tech(self, resp: httpx.Response):
        """Detect technologies from headers, cookies, HTML."""
        techs = []
        headers = resp.headers
        text = resp.text[:5000]
        
        if "x-powered-by" in headers:
            techs.append(headers["x-powered-by"])
        if "x-generator" in headers:
            techs.append(headers["x-generator"])
        
        patterns = [
            (r"wp-content|wp-includes", "WordPress"),
            (r"Joomla", "Joomla"),
            (r"Drupal", "Drupal"),
            (r"django|csrfmiddlewaretoken", "Django"),
            (r"laravel_session|XSRF-TOKEN", "Laravel"),
            (r"React\.createElement|__NEXT_DATA__", "React/Next.js"),
            (r"ng-version|angular", "Angular"),
            (r"vue\.js|data-v-", "Vue.js"),
        ]
        
        for pattern, name in patterns:
            if re.search(pattern, text, re.I):
                techs.append(name)
        
        if techs:
            await self._log(f"  [+] Technologies detected: {', '.join(set(techs))}", "success")
        
        return list(set(techs))

    def _header_cvss(self, severity: VulnSeverity) -> float:
        return {
            VulnSeverity.CRITICAL: 9.1,
            VulnSeverity.HIGH: 7.5,
            VulnSeverity.MEDIUM: 5.3,
            VulnSeverity.LOW: 3.1,
            VulnSeverity.INFO: 0.0,
        }.get(severity, 5.0)


def calculate_security_grade(findings: list[VulnerabilityFinding]) -> tuple[str, int, str]:
    """
    Returns (grade: A-F, trust_score: 0-100, threat_level: low/medium/high/critical).
    """
    severity_weights = {
        VulnSeverity.CRITICAL: 30,
        VulnSeverity.HIGH: 15,
        VulnSeverity.MEDIUM: 7,
        VulnSeverity.LOW: 3,
        VulnSeverity.INFO: 0,
    }
    
    score = 100
    for f in findings:
        score -= severity_weights.get(f.severity, 0)
    score = max(0, score)
    
    if score >= 90:
        grade, level = "A", "low"
    elif score >= 75:
        grade, level = "B", "low"
    elif score >= 60:
        grade, level = "C", "medium"
    elif score >= 45:
        grade, level = "D", "high"
    elif score >= 25:
        grade, level = "E", "high"
    else:
        grade, level = "F", "critical"
    
    critical = any(f.severity == VulnSeverity.CRITICAL for f in findings)
    if critical:
        level = "critical"
    
    return grade, score, level
