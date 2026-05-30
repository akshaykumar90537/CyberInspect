'use client'
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, Activity, Scan, TrendingUp, TrendingDown,
  Clock, Globe, Zap, Target, Eye, BarChart3, ArrowUpRight
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import TopBar from '@/components/layout/TopBar'
import Link from 'next/link'

// ── Mock data ──────────────────────────────────────────────────────────────
const scanTrend = [
  { day: 'Mon', scans: 4, vulns: 12 },
  { day: 'Tue', scans: 7, vulns: 23 },
  { day: 'Wed', scans: 3, vulns: 8 },
  { day: 'Thu', scans: 9, vulns: 31 },
  { day: 'Fri', scans: 6, vulns: 19 },
  { day: 'Sat', scans: 2, vulns: 5 },
  { day: 'Sun', scans: 8, vulns: 28 },
]

const severityDist = [
  { name: 'Critical', value: 8, color: '#ff3d5a' },
  { name: 'High', value: 19, color: '#ff8c42' },
  { name: 'Medium', value: 34, color: '#ffb800' },
  { name: 'Low', value: 47, color: '#00d4ff' },
  { name: 'Info', value: 23, color: '#8b5cf6' },
]

const radarData = [
  { subject: 'Headers', A: 40 },
  { subject: 'Auth', A: 75 },
  { subject: 'Injection', A: 55 },
  { subject: 'Crypto', A: 85 },
  { subject: 'Config', A: 30 },
  { subject: 'Exposure', A: 60 },
]

const recentScans = [
  { url: 'api.acme.com', grade: 'D', score: 42, vulns: 11, critical: 2, time: '2m ago', status: 'completed' },
  { url: 'shop.example.com', grade: 'C', score: 61, vulns: 7, critical: 0, time: '18m ago', status: 'completed' },
  { url: 'internal.corp.io', grade: 'F', score: 18, vulns: 23, critical: 5, time: '1h ago', status: 'completed' },
  { url: 'staging.myapp.dev', grade: 'B', score: 78, vulns: 3, critical: 0, time: '3h ago', status: 'completed' },
  { url: 'admin.dashboard.net', grade: 'A', score: 94, vulns: 1, critical: 0, time: '5h ago', status: 'completed' },
]

const gradeColor = (g: string) => ({
  A: 'text-green-400', B: 'text-cyan-400', C: 'text-yellow-400',
  D: 'text-orange-400', E: 'text-red-400', F: 'text-red-500',
}[g] ?? 'text-slate-400')

const STATS = [
  { label: 'Total Scans', value: '1,284', delta: '+12%', up: true, icon: Scan, color: '#00d4ff' },
  { label: 'Active Scans', value: '3', delta: 'Running now', up: true, icon: Activity, color: '#00ff9d', pulse: true },
  { label: 'Critical Findings', value: '47', delta: '+3 today', up: false, icon: AlertTriangle, color: '#ff3d5a' },
  { label: 'Avg Risk Score', value: '6.2', delta: '-0.4 this week', up: true, icon: Shield, color: '#8b5cf6' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card border border-[#1a2a45] p-3 rounded-lg text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Security Dashboard" subtitle="Real-time vulnerability intelligence" />
      <div className="flex-1 p-6 space-y-6">
        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-4 hover:-translate-y-[1px] cursor-default group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                  <s.icon size={17} style={{ color: s.color }}
                    className={s.pulse ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider ${s.up ? 'text-[#00ff9d]' : 'text-[#ff3d5a]'}`}>
                  {s.up ? '▲' : '▼'} {s.delta.split(' ')[0]}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-0.5 tracking-tight font-sans">{s.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── CHARTS ROW 1 ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Scan trend area chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Scan Activity</h3>
                <p className="card-sub">Scans and vulnerabilities per day</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" /> Scans</span>
                <span className="flex items-center gap-1.5 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Vulns</span>
              </div>
            </div>
            <div className="card-body !py-4">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={scanTrend}>
                  <defs>
                    <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="vulnsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3d5a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ff3d5a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="scans" stroke="#00d4ff" fill="url(#scansGrad)" strokeWidth={1.5} dot={false} name="Scans" />
                  <Area type="monotone" dataKey="vulns" stroke="#ff3d5a" fill="url(#vulnsGrad)" strokeWidth={1.5} dot={false} name="Vulns" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Severity pie chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Severity Distribution</h3>
                <p className="card-sub">All findings this month</p>
              </div>
            </div>
            <div className="card-body flex items-center gap-4 !py-4">
              <div className="w-[100px] h-[100px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severityDist} cx="50%" cy="50%" innerRadius={35} outerRadius={48}
                      dataKey="value" paddingAngle={2}>
                      {severityDist.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1">
                {severityDist.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-slate-400 font-medium">{s.name}</span>
                    </span>
                    <span className="font-mono text-slate-300 font-bold">{s.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      </div>

        {/* ── CHARTS ROW 2 ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Security radar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Security Coverage</h3>
                <p className="card-sub">Attack surface assessment</p>
              </div>
            </div>
            <div className="card-body !py-2">
              <ResponsiveContainer width="100%" height={165}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#0f2040" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9 }} />
                  <Radar name="Score" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.12} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent scans table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="lg:col-span-2 card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Scans</h3>
                <p className="card-sub">Latest security assessments</p>
              </div>
              <Link href="/scanner" className="text-[10px] font-bold uppercase tracking-wider text-[#00d4ff] hover:text-cyan-300 flex items-center gap-1">
                New scan <ArrowUpRight size={11} />
              </Link>
            </div>
            <div className="card-body !p-0 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Target</th>
                    <th>Status</th>
                    <th>Findings</th>
                    <th>Grade</th>
                    <th>Score</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((scan, i) => (
                    <tr key={scan.url} className="cursor-pointer">
                      <td className="font-mono text-[#00d4ff] font-semibold">{scan.url}</td>
                      <td>
                        <span className="badge badge-completed">completed</span>
                      </td>
                      <td>
                        {scan.vulns > 0 ? (
                          <div className="flex gap-1.5">
                            {scan.critical > 0 && <span className="badge badge-critical">{scan.critical} critical</span>}
                            <span className="badge badge-medium">{scan.vulns - scan.critical} other</span>
                          </div>
                        ) : (
                          <span className="badge badge-completed">Clean</span>
                        )}
                      </td>
                      <td>
                        <span className={`font-black text-sm ${gradeColor(scan.grade)}`}>{scan.grade}</span>
                      </td>
                      <td className="font-mono text-slate-300">{scan.score}/100</td>
                      <td className="text-slate-500 font-mono">{scan.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* ── THREAT INTEL CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: '⚑ Most Exploited', icon: Target, color: '#ff3d5a', badgeType: 'badge-critical', items: ['SQL Injection', 'XSS Reflected', 'Missing CSP'], tag: 'Active threats' },
            { title: '⚡ Quick Wins', icon: Zap, color: '#00ff9d', badgeType: 'badge-completed', items: ['Add HSTS Header', 'Enable CSP', 'Fix Cookie Flags'], tag: 'Easy fixes' },
            { title: '👁 Trending CVEs', icon: Eye, color: '#8b5cf6', badgeType: 'badge-info', items: ['CVE-2024-1234', 'CVE-2024-5678', 'CVE-2024-9012'], tag: 'This week' },
          ].map((card, i) => (
            <motion.div key={card.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
              className="card p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}12`, border: `1px solid ${card.color}20` }}>
                  <card.icon size={14} style={{ color: card.color }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">{card.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{card.tag}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                {card.items.map((item, j) => (
                  <div key={item} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] justify-between">
                    <span className="text-slate-300 font-medium">{item}</span>
                    <span className={`badge ${card.badgeType} scale-[0.9]`}>{j === 0 ? 'critical' : j === 1 ? 'high' : 'medium'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
