'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scan, Globe, Zap, Shield, ChevronRight, Terminal,
  AlertTriangle, CheckCircle2, Loader2, Clock, Settings2
} from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { useRouter } from 'next/navigation'

const SCAN_TYPES = [
  { id: 'quick', label: 'Quick Scan', desc: '~30 seconds · Headers + SSL + Basic checks', icon: Zap, color: '#00d4ff' },
  { id: 'full', label: 'Full Scan', desc: '~2 minutes · All checks + Form testing + Path enum', icon: Shield, color: '#8b5cf6' },
  { id: 'deep', label: 'Deep Scan', desc: '~10 minutes · Everything + Active probing + ZAP', icon: Terminal, color: '#ff8c42' },
]

const FAKE_LOG_SEQUENCES: Record<string, { msg: string; lvl: string }[]> = {
  quick: [
    { msg: '[*] Initializing CyberInspect AI scan engine v1.0...', lvl: 'info' },
    { msg: '[*] Resolving target hostname...', lvl: 'info' },
    { msg: '[+] Target resolved. Starting quick scan...', lvl: 'success' },
    { msg: '[*] Fetching HTTP response headers...', lvl: 'info' },
    { msg: '[!] MISSING: Strict-Transport-Security (HSTS)', lvl: 'warning' },
    { msg: '[!] MISSING: Content-Security-Policy', lvl: 'warning' },
    { msg: '[!] MISSING: X-Frame-Options', lvl: 'warning' },
    { msg: '[*] Checking SSL/TLS certificate...', lvl: 'info' },
    { msg: '[+] SSL certificate valid. TLS 1.3 supported.', lvl: 'success' },
    { msg: '[*] Analyzing cookie security attributes...', lvl: 'info' },
    { msg: '[!] Insecure cookie: session (missing HttpOnly + SameSite)', lvl: 'warning' },
    { msg: '[*] Checking CORS configuration...', lvl: 'info' },
    { msg: '[+] CORS appears correctly configured.', lvl: 'success' },
    { msg: '[+] Quick scan complete. Generating results...', lvl: 'success' },
  ],
  full: [
    { msg: '[*] Initializing CyberInspect AI scan engine v1.0...', lvl: 'info' },
    { msg: '[*] Resolving target hostname and IP...', lvl: 'info' },
    { msg: '[+] Target resolved. Launching full scan pipeline...', lvl: 'success' },
    { msg: '[*] Phase 1: Security header analysis (7 checks)...', lvl: 'info' },
    { msg: '[!] MISSING: Strict-Transport-Security (HSTS) [CVSS 7.5]', lvl: 'warning' },
    { msg: '[!] MISSING: Content-Security-Policy [CVSS 7.5]', lvl: 'warning' },
    { msg: '[!] MISSING: Permissions-Policy', lvl: 'warning' },
    { msg: '[+] 4 of 7 headers present. 3 missing.', lvl: 'info' },
    { msg: '[*] Phase 2: SSL/TLS deep inspection...', lvl: 'info' },
    { msg: '[+] TLS 1.3 active. No weak ciphers detected.', lvl: 'success' },
    { msg: '[*] Phase 3: Technology fingerprinting...', lvl: 'info' },
    { msg: '[+] Detected: Nginx 1.24 · Node.js · React · PostgreSQL', lvl: 'success' },
    { msg: '[*] Phase 4: Path enumeration (34 paths)...', lvl: 'info' },
    { msg: '[!!!] FOUND: /.git/config accessible (HTTP 200) [CRITICAL]', lvl: 'error' },
    { msg: '[!!!] FOUND: /admin/ accessible (HTTP 200) [CRITICAL]', lvl: 'error' },
    { msg: '[!] FOUND: /phpinfo.php (HTTP 403) [MEDIUM]', lvl: 'warning' },
    { msg: '[*] Phase 5: Form discovery and XSS/SQLi testing...', lvl: 'info' },
    { msg: '[+] Discovered 4 form(s). Testing 12 input parameters...', lvl: 'info' },
    { msg: '[!!!] CRITICAL: Reflected XSS in /search?q= [CVSS 7.4]', lvl: 'error' },
    { msg: '[!!!] CRITICAL: SQL Injection in /api/users?id= [CVSS 9.8]', lvl: 'error' },
    { msg: '[*] Phase 6: Open redirect testing...', lvl: 'info' },
    { msg: '[!] Open redirect via ?redirect= parameter [CVSS 6.1]', lvl: 'warning' },
    { msg: '[*] Phase 7: Cookie security analysis...', lvl: 'info' },
    { msg: '[!] Cookie "auth_token": missing Secure + HttpOnly flags', lvl: 'warning' },
    { msg: '[*] Calculating AI risk score...', lvl: 'info' },
    { msg: '[+] Security Grade: D | Trust Score: 38/100 | Threat Level: HIGH', lvl: 'success' },
    { msg: '[+] Full scan complete. 13 findings across 5 categories.', lvl: 'success' },
  ],
  deep: [
    { msg: '[*] Initializing CyberInspect AI deep scan engine...', lvl: 'info' },
    { msg: '[*] Spinning up OWASP ZAP proxy integration...', lvl: 'info' },
    { msg: '[+] ZAP daemon ready on port 8080', lvl: 'success' },
    { msg: '[*] Starting passive spider crawl...', lvl: 'info' },
    { msg: '[+] Spider discovered 127 URLs across 8 directories', lvl: 'success' },
    { msg: '[*] Running all passive scan rules...', lvl: 'info' },
    { msg: '[!!!] ZAP: SQL Injection [/api/products?category=] CVSS 9.8', lvl: 'error' },
    { msg: '[!!!] ZAP: Stored XSS [/comments POST body] CVSS 8.2', lvl: 'error' },
    { msg: '[!!!] ZAP: CSRF token missing on sensitive endpoints', lvl: 'error' },
    { msg: '[*] Running active scan rules (may trigger WAF)...', lvl: 'info' },
    { msg: '[!] ZAP: Path traversal probe on /api/file?path=', lvl: 'warning' },
    { msg: '[!!!] CONFIRMED: Directory traversal /../../../etc/passwd', lvl: 'error' },
    { msg: '[*] Running Nmap port scan (top 1000)...', lvl: 'info' },
    { msg: '[+] Open ports: 22/ssh, 80/http, 443/https, 5432/postgres(!)' , lvl: 'warning' },
    { msg: '[!!!] PostgreSQL exposed on public interface [CRITICAL]', lvl: 'error' },
    { msg: '[*] SSL/TLS deep analysis with SSLyze...', lvl: 'info' },
    { msg: '[!] TLS 1.0 still supported alongside TLS 1.3', lvl: 'warning' },
    { msg: '[*] Running AI risk correlation engine...', lvl: 'info' },
    { msg: '[+] Attack chain identified: SQLi → RCE → Data exfiltration', lvl: 'error' },
    { msg: '[+] Security Grade: F | Trust Score: 12/100 | Threat Level: CRITICAL', lvl: 'success' },
    { msg: '[+] Deep scan complete. 21 findings. Immediate action required.', lvl: 'success' },
  ],
}

type LogEntry = { msg: string; lvl: string; ts: string }
type ScanPhase = 'idle' | 'scanning' | 'done'

export default function ScannerPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [scanType, setScanType] = useState('full')
  const [phase, setPhase] = useState<ScanPhase>('idle')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [progress, setProgress] = useState(0)
  const [scanId, setScanId] = useState<string | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const addLog = (msg: string, lvl: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false })
    setLogs(prev => [...prev, { msg, lvl, ts }])
  }

  const startScan = async () => {
    if (!url.trim()) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      addLog('[!] URL must start with http:// or https://', 'error')
      return
    }

    setPhase('scanning')
    setLogs([])
    setProgress(0)

    // Create scan via API
    let apiScanId: string | null = null
    try {
      const res = await fetch('/api/v1/scans/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: url, scan_type: scanType }),
      })
      if (res.ok) {
        const data = await res.json()
        apiScanId = data.id
        setScanId(data.id)
      }
    } catch { /* API might not be running – still demo the UI */ }

    // Stream fake logs for UI demo
    const sequence = FAKE_LOG_SEQUENCES[scanType] || FAKE_LOG_SEQUENCES.full
    const totalSteps = sequence.length
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400))
      addLog(sequence[i].msg, sequence[i].lvl)
      setProgress(Math.round(((i + 1) / totalSteps) * 100))
    }

    setPhase('done')
    // Navigate to results after brief pause
    setTimeout(() => {
      if (apiScanId) router.push(`/results/${apiScanId}`)
    }, 1500)
  }

  const logColor = (lvl: string) => ({
    info: 'text-slate-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  }[lvl] ?? 'text-slate-400')

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Vulnerability Scanner" subtitle="AI-powered web application security testing" />

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* URL Input card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Target URL</h2>
          <p className="text-sm text-slate-500 mb-4">Enter the web application you want to scan. Ensure you have authorization.</p>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 bg-[#060912] border border-[#1a2a45] focus-within:border-cyan-500/50 rounded-xl px-4 py-3 transition-all">
              <Globe size={16} className="text-slate-500 shrink-0" />
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && phase === 'idle' && startScan()}
                placeholder="https://target-application.com"
                disabled={phase === 'scanning'}
                className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none text-sm font-mono"
              />
            </div>
            <button
              onClick={startScan}
              disabled={phase === 'scanning' || !url.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-cyan-500/25 whitespace-nowrap">
              {phase === 'scanning'
                ? <><Loader2 size={15} className="animate-spin" /> Scanning...</>
                : <><Scan size={15} /> Launch Scan</>}
            </button>
          </div>
        </motion.div>

        {/* Scan type selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SCAN_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => phase === 'idle' && setScanType(type.id)}
                disabled={phase === 'scanning'}
                className={`text-left p-4 rounded-xl border transition-all ${
                  scanType === type.id
                    ? 'border-cyan-500/40 bg-cyan-950/20'
                    : 'border-[#1a2a45] bg-[#0f1929]/50 hover:border-[#2a3a55]'
                }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <type.icon size={15} style={{ color: type.color }} />
                  <span className="text-sm font-medium text-white">{type.label}</span>
                  {scanType === type.id && <CheckCircle2 size={13} className="text-cyan-400 ml-auto" />}
                </div>
                <p className="text-xs text-slate-500">{type.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Terminal output */}
        <AnimatePresence>
          {(phase === 'scanning' || phase === 'done' || logs.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#060912] border-b border-[#1a2a45]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">cyberinspect@scanner — {url || 'target'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {phase === 'scanning' && (
                    <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {phase === 'done' && (
                    <span className="flex items-center gap-1.5 text-xs text-green-400">
                      <CheckCircle2 size={12} /> COMPLETE
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-600">{progress}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-0.5 bg-[#1a2a45]">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>

              {/* Log output */}
              <div className="p-5 font-mono text-xs space-y-1 max-h-80 overflow-y-auto bg-[#060912]/80">
                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 leading-relaxed ${logColor(log.lvl)}`}>
                      <span className="text-slate-600 shrink-0 select-none">{log.ts}</span>
                      <span>{log.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {phase === 'scanning' && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-cyan-400">█</motion.span>
                )}
                <div ref={logsEndRef} />
              </div>

              {/* Done — View results CTA */}
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-5 py-4 bg-green-950/20 border-t border-green-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 size={16} />
                    Scan complete! Results are ready.
                  </div>
                  {scanId && (
                    <button
                      onClick={() => router.push(`/results/${scanId}`)}
                      className="flex items-center gap-2 text-sm bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all">
                      View Results <ChevronRight size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        {phase === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon: Shield, title: 'Always get authorization', desc: 'Only scan sites you own or have explicit permission to test.' },
              { icon: Clock, title: 'Quick scan in ~30s', desc: 'Great for CI/CD pipelines. Checks headers, SSL, and cookies.' },
              { icon: Settings2, title: 'Deep scan for full audit', desc: 'Use Deep Scan for comprehensive penetration testing.' },
            ].map(tip => (
              <div key={tip.title} className="flex gap-3 p-4 rounded-xl bg-[#0f1929]/50 border border-[#1a2a45]/50">
                <tip.icon size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-300 mb-0.5">{tip.title}</div>
                  <div className="text-xs text-slate-500">{tip.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
