"""
AI Security Assistant service — powered by OpenAI GPT-4.
Explains vulnerabilities, generates remediation guidance, and answers security questions.
"""
from openai import AsyncOpenAI
from app.core.config import settings

SYSTEM_PROMPT = """You are CyberInspect AI, an expert cybersecurity assistant embedded in a vulnerability scanning platform.

Your role:
- Explain security vulnerabilities in clear, actionable terms
- Provide specific remediation steps with code examples when relevant
- Analyze scan results and prioritize risks
- Answer general web application security questions
- Reference OWASP, CVEs, and industry standards

Tone: Professional but approachable. Be concise and specific.
Format: Use markdown. For code examples, use appropriate language fences.
Always end responses with a confidence level: [High/Medium/Low confidence]"""


async def get_ai_response(messages: list[dict], context: str = "") -> str:
    """Send messages to OpenAI and return the assistant's response."""
    if not settings.OPENAI_API_KEY:
        return _fallback_response(messages)
    
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    system_content = SYSTEM_PROMPT
    if context:
        system_content += f"\n\nCurrent scan context:\n{context}"
    
    full_messages = [{"role": "system", "content": system_content}] + messages
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=full_messages,
        max_tokens=1500,
        temperature=0.3,
    )
    
    return response.choices[0].message.content


def _fallback_response(messages: list[dict]) -> str:
    """Fallback response when OpenAI is not configured."""
    last_msg = messages[-1]["content"].lower() if messages else ""
    
    if "xss" in last_msg:
        return """## Cross-Site Scripting (XSS)

XSS allows attackers to inject malicious scripts into web pages viewed by other users.

**Remediation:**
1. **Encode output**: HTML-encode all user-supplied data before rendering
2. **Use CSP**: Add `Content-Security-Policy: default-src 'self'`
3. **Sanitize input**: Use libraries like DOMPurify for HTML content
4. **Use modern frameworks**: React/Vue auto-escape by default

```javascript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Safe
element.textContent = userInput;
// or
element.innerHTML = DOMPurify.sanitize(userInput);
```

[High confidence]"""
    
    if "sql" in last_msg:
        return """## SQL Injection

SQL injection allows attackers to manipulate database queries by injecting malicious SQL.

**Remediation:**
1. **Use parameterized queries** (never concatenate user input into SQL)
2. **Use an ORM** (SQLAlchemy, Hibernate, etc.)
3. **Principle of least privilege** on database accounts
4. **Input validation** as a defense-in-depth measure

```python
# ❌ Vulnerable
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ Safe (parameterized)
query = "SELECT * FROM users WHERE email = ?"
cursor.execute(query, (email,))
```

[High confidence]"""
    
    return """I'm your CyberInspect AI security assistant. I can help you understand vulnerabilities found in your scans, explain attack vectors, and provide remediation guidance.

**I can help with:**
- Explaining specific vulnerability types (XSS, SQLi, CSRF, etc.)
- Prioritizing which vulnerabilities to fix first
- Code-level remediation examples
- Understanding CVSS scores and severity levels
- OWASP Top 10 guidance

What would you like to know? [High confidence]"""


async def generate_executive_summary(scan_data: dict) -> str:
    """Generate an executive summary for a completed scan."""
    if not settings.OPENAI_API_KEY:
        total = scan_data.get("total_vulnerabilities", 0)
        critical = scan_data.get("critical_count", 0)
        grade = scan_data.get("security_grade", "N/A")
        return (
            f"Security assessment of {scan_data.get('target_url', 'the target')} identified "
            f"{total} vulnerability(ies) including {critical} critical finding(s). "
            f"Overall security grade: {grade}. Immediate remediation of critical and high severity "
            f"issues is strongly recommended."
        )
    
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = f"""Generate a concise executive summary (2-3 paragraphs) for this security scan:

Target: {scan_data.get('target_url')}
Grade: {scan_data.get('security_grade')}
Trust Score: {scan_data.get('trust_score')}/100
Total Vulnerabilities: {scan_data.get('total_vulnerabilities')}
Critical: {scan_data.get('critical_count')}, High: {scan_data.get('high_count')}, Medium: {scan_data.get('medium_count')}
Technologies: {', '.join(scan_data.get('technologies', []))}

Write for a non-technical executive audience. Be direct about risk level."""
    
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
    )
    return response.choices[0].message.content
