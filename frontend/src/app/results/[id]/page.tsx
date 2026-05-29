'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, Shield, Globe, Clock, Download, Share2,
  ChevronDown, ChevronUp, ExternalLink, CheckCircle2,
  XCircle, Info, Zap, BarChart3, FileText, ArrowLeft
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts'
import TopBar from '@/components/layout/TopBar'
import Link from 'next/link'

// ── Mock scan result (replace with real API data) ──────────────────────────
const MOCK_RESULT = {
  id: 'demo-scan-001',
  target_url: 'https://demo.target.com',
  target_domain: 'demo.target.com',
  scan_type: 'full',
  status: 'completed',
  security_grade: 'D',
  trust_score: 42,
  threat_level: 'high',
  risk_score: 5.8,
  total_vulnerabilities: 13,
  critical_count: 2,
  high_count: 4,
  medium_count: 5,
  low_count: 2,
  info_count: 0,
  technologies: ['Nginx 1.24', 'Node.js 20', 'React', 'PostgreSQL 14'],
  completed_at: new Date().toISOString(),
  vulnerabilities: [
    {
      id: '1', name: 'SQL Injection', category: 'injection', severity: 'critical',
      cvss_score: 9.8, cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      description: 'SQL injection vulnerability detected in the user lookup endpoint. Attacker can extract, modify, or delete database contents.',
      affected_url: 'https://demo.target.com/api/users?id=1',
      parameter: 'id', evidence: "Payload: 1' OR '1'='1 — Response contained extra rows",
      remediation: 'Use parameterized queries or an ORM. Never concatenate user input directly into SQL strings.',
      exploit_probability: 0.92,
    },
    {
      id: '2', name: 'Exposed .git/config', category: 'exposure', severity: 'critical',
      cvss_score: 8.6, description: 'Git configuration file is publicly accessible. Attacker can enumerate repository URLs, credentials, and codebase.',
      affected_url: 'https://demo.target.com/.git/config',
      remediation: 'Block access to .git/ directory via web server config: deny from all in .htaccess or location ~ /\\.git { deny all; } in Nginx.',
      exploit_probability: 0.88,
    },
    {
      id: '3', name: 'Reflected Cross-Site Scripting', category: 'xss', severity: 'high',
      cvss_score: 7.4, description: 'User input in the search parameter is reflected in the response without encoding.',
      affected_url: 'https://demo.target.com/search?q=test',
      parameter: 'q', evidence: 'Payload <script>alert(1)</script> reflected in response body',
      remediation: 'HTML-encode all user-supplied output. Implement Content-Security-Policy header.',
      exploit_probability: 0.75,
    },
    {
      id: '4', name: 'Missing Content-Security-Policy', category: 'headers', severity: 'high',
      cvss_score: 7.5, description: 'No Content-Security-Policy header is set, leaving the site vulnerable to XSS and data injection attacks.',
      affected_url: 'https://demo.target.com',
      remediation: "Add header: Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'",
      exploit_probability: 0.70,
    },
    {
      id: '5', name: 'Missing HSTS Header', category: 'headers', severity: 'high',
      cvss_score: 7.5, description: 'Strict-Transport-Security header is missing. Browsers may downgrade connections to HTTP.',
      affected_url: 'https://demo.target.com',
      remediation: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
      exploit_probability: 0.65,
    },
    {
      id: '6', name: 'Open Redirect', category: 'redirect', severity: 'medium',
      cvss_score: 6.1, description: 'The redirect parameter accepts arbitrary URLs, enabling phishing redirects.',
      affected_url: 'https://demo.target.com/login?redirect=https://evil.com',
      parameter: 'redirect',
      remediation: 'Validate redirect URLs against a whitelist of allowed paths.',
      exploit_probability: 0.45,
    },
    {
      id: '7', name: 'Insecure Cookie: auth_token', category: 'cookies', severity: 'medium',
      cvss_score: 5.3, description: 'Session cookie is missing Secure and HttpOnly flags.',
      affected_url: 'https://demo.target.com',
      evidence: 'Set-Cookie: auth_token=xxx (no Secure, no HttpOnly)',
      remediation: 'Set: Set-Cookie: auth_token=value; Secure; HttpOnly; SameSite=Strict',
      exploit_probability: 0.48,
    },
    {
      id: '8', name: 'Server Version Disclosure', category: 'exposure', severity: 'low',
      cvss_score: 3.1, description: 'Server header discloses exact Nginx version, aiding attackers in finding version-specific exploits.',
      affected_url: 'https://demo.target.com', evidence: 'Server: nginx/1.24.0',
      remediation: 'Set server_tokens off; in Nginx config.',
      exploit_probability: 0.20,
    },
  ],
}

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  critical: { color: '#ff3d5a', bg: 'bg-red-950/40', border: 'border-red-800/40', icon: XCircle },
  high:     { color: '#ff8c42', bg: 'bg-orange-950/40', border: 'border-orange-800/40', icon: AlertTriangle },
  medium:   { color: '#ffb800', bg: 'bg-yellow-950/40', border: 'border-yellow-800/40', icon: AlertTriangle },
  low:      { color: '#00d4ff', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40', icon: Info },
  info:     { color: '#8b5cf6', bg: 'bg-purple-950/40', border: 'border-purple-800/40', icon: Info },
}

const gradeStyle: Record<string, string> = {
  A: 'text-green-400', B: 'text-cyan-400', C: 'text-yellow-400',
  D: 'text-orange-400', E: 'text-red-400', F: 'text-red-500',
}

function VulnCard({ v }: { v: typeof MOCK_RESULT.vulnerabilities[0] }) {
  const [open, setOpen] = useState(false)
  const cfg = severityConfig[v.severity] ?? severityConfig.info
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <Icon size={15} style={{ color: cfg.color }} className="shrink-0" />
          <div>
            <div className="font-medium text-white text-sm">{v.name}</div>
            {v.affected_url && (
              <div className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                {v.affected_url}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {v.cvss_score && (
            <span className="text-xs font-mono text-slate-400">CVSS {v.cvss_score.toFixed(1)}</span>
          )}
          <span className="text-xs px-2 py-0.5 rounded border font-medium capitalize"
            style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}12` }}>
            {v.severity}
          </span>
          {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{v.description}</p>

          {v.evidence && (
            <div className="bg-[#060912] rounded-lg p-3 font-mono text-xs text-slate-400 border border-[#1a2a45]">
              <div className="text-slate-600 text-xs mb-1">Evidence</div>
              {v.evidence}
            </div>
          )}

          <div className="bg-green-950/20 border border-green-800/30 rounded-lg p-3">
            <div className="text-xs font-semibold text-green-400 mb-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> Remediation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{v.remediation}</p>
          </div>

          {v.exploit_probability !== undefined && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Exploit probability:</span>
              <div className="flex-1 h-1.5 bg-[#1a2a45] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(v.exploit_probability * 100).toFixed(0)}%`, background: cfg.color }} />
              </div>
              <span className="font-mono" style={{ color: cfg.color }}>
                {(v.exploit_probability * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [scan, setScan] = useState(MOCK_RESULT)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to fetch real scan data
    fetch(`/api/v1/scans/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setScan(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  const filteredVulns = scan.vulnerabilities.filter(v =>
    activeFilter === 'all' || v.severity === activeFilter
  )

  const radarData = [
    { subject: 'Injection', score: scan.vulnerabilities.filter(v => v.category === 'injection').length > 0 ? 20 : 80 },
    { subject: 'XSS', score: scan.vulnerabilities.filter(v => v.category === 'xss').length > 0 ? 30 : 90 },
    { subject: 'Headers', score: scan.vulnerabilities.filter(v => v.category === 'headers').length * 15 },
    { subject: 'Crypto', score: 75 },
    { subject: 'Exposure', score: scan.vulnerabilities.filter(v => v.category === 'exposure').length > 0 ? 25 : 85 },
    { subject: 'Config', score: 60 },
  ]

  const pieData = [
    { name: 'Critical', value: scan.critical_count, color: '#ff3d5a' },
    { name: 'High', value: scan.high_count, color: '#ff8c42' },
    { name: 'Medium', value: scan.medium_count, color: '#ffb800' },
    { name: 'Low', value: scan.low_count, color: '#00d4ff' },
  ].filter(d => d.value > 0)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Scan Results" subtitle={scan.target_url} />

      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Link href="/scanner" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={15} /> Back to Scanner
          </Link>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm border border-[#1a2a45] hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 px-4 py-2 rounded-lg transition-all">
              <Share2 size={14} /> Share
            </button>
            <button className="flex items-center gap-2 text-sm bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg transition-all">
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Grade card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-5 flex flex-col items-center justify-center text-center">
            <div className="text-xs text-slate-500 mb-1">Security Grade</div>
            <div className={`text-6xl font-black ${gradeStyle[scan.security_grade ?? 'F']}`}>
              {scan.security_grade}
            </div>
            <div className="text-xs text-slate-500 mt-1">Trust Score: {scan.trust_score}/100</div>
          </motion.div>

          {/* Threat level */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}
            className="glass-card p-5 flex flex-col items-center justify-center text-center">
            <div className="text-xs text-slate-500 mb-2">Threat Level</div>
            <div className={`text-lg font-bold uppercase tracking-widest ${
              scan.threat_level === 'critical' ? 'text-red-400' :
              scan.threat_level === 'high' ? 'text-orange-400' :
              scan.threat_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
            }`}>{scan.threat_level}</div>
            <div className="mt-2 flex gap-1">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`w-4 h-1.5 rounded-full ${
                  n <= (scan.threat_level === 'critical' ? 5 : scan.threat_level === 'high' ? 4 : scan.threat_level === 'medium' ? 3 : 2)
                    ? 'bg-red-500' : 'bg-[#1a2a45]'
                }`} />
              ))}
            </div>
          </motion.div>

          {/* Vuln counts */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }}
            className="glass-card p-5">
            <div className="text-xs text-slate-500 mb-3">Vulnerabilities</div>
            <div className="space-y-1.5">
              {[
                { label: 'Critical', count: scan.critical_count, color: '#ff3d5a' },
                { label: 'High', count: scan.high_count, color: '#ff8c42' },
                { label: 'Medium', count: scan.medium_count, color: '#ffb800' },
                { label: 'Low', count: scan.low_count, color: '#00d4ff' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="font-mono font-bold" style={{ color: row.color }}>{row.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tech stack */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 }}
            className="glass-card p-5">
            <div className="text-xs text-slate-500 mb-3">Technologies Detected</div>
            <div className="flex flex-wrap gap-1.5">
              {scan.technologies.map(tech => (
                <span key={tech} className="text-xs px-2 py-0.5 rounded bg-[#0f1929] border border-[#1a2a45] text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Charts + Vuln list */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Charts column */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Attack Surface</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1a2a45" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar dataKey="score" stroke="#ff3d5a" fill="#ff3d5a" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Severity Breakdown</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#0f1929', border: '1px solid #1a2a45', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-1">
                {pieData.map(p => (
                  <span key={p.name} className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    {p.name} ({p.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Vulnerability list */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                <button key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all ${
                    activeFilter === f
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                      : 'border-[#1a2a45] text-slate-400 hover:border-[#2a3a55]'
                  }`}>
                  {f} {f !== 'all' && `(${scan[`${f}_count` as keyof typeof scan] || 0})`}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredVulns.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-500">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
                  No {activeFilter} severity findings!
                </div>
              ) : (
                filteredVulns.map(v => <VulnCard key={v.id} v={v} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
