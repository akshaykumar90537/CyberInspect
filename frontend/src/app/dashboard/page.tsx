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
              className="glass-card p-5 hover:scale-[1.02] transition-transform cursor-default group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  <s.icon size={18} style={{ color: s.color }}
                    className={s.pulse ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-xs flex items-center gap-1 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                  {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {s.delta}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── CHARTS ROW 1 ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Scan trend area chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Scan Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scans and vulnerabilities per day</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Scans</span>
                <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Vulns</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scanTrend}>
                <defs>
                  <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="vulnsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3d5a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff3d5a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="scans" stroke="#00d4ff" fill="url(#scansGrad)" strokeWidth={2} dot={false} name="Scans" />
                <Area type="monotone" dataKey="vulns" stroke="#ff3d5a" fill="url(#vulnsGrad)" strokeWidth={2} dot={false} name="Vulns" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Severity pie chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white text-sm mb-1">Severity Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">All vulnerabilities this month</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={severityDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}>
                  {severityDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {severityDist.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-slate-400">{s.name}</span>
                  </span>
                  <span className="font-mono text-slate-300">{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── CHARTS ROW 2 ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Security radar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="glass-card p-5">
            <h3 className="font-semibold text-white text-sm mb-1">Security Coverage</h3>
            <p className="text-xs text-slate-500 mb-2">Attack surface assessment</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1a2a45" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent scans table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Recent Scans</h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest security assessments</p>
              </div>
              <Link href="/scanner" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                New scan <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentScans.map((scan, i) => (
                <motion.div key={scan.url}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#060912]/60 hover:bg-[#060912] border border-transparent hover:border-[#1a2a45] transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Globe size={14} className="text-slate-500 shrink-0" />
                    <div>
                      <div className="text-sm text-slate-200 font-mono">{scan.url}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {scan.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center hidden sm:block">
                      <div className="text-xs text-slate-500">Vulns</div>
                      <div className="text-sm font-bold text-slate-200">{scan.vulns}</div>
                    </div>
                    {scan.critical > 0 && (
                      <div className="text-center">
                        <div className="text-xs text-red-400">{scan.critical} critical</div>
                      </div>
                    )}
                    <div className={`text-2xl font-black ${gradeColor(scan.grade)}`}>{scan.grade}</div>
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-slate-500">Score</div>
                      <div className="text-sm font-mono text-slate-200">{scan.score}/100</div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── THREAT INTEL CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Most Exploited', icon: Target, color: '#ff3d5a', items: ['SQL Injection', 'XSS Reflected', 'Missing CSP'], tag: 'Active threats' },
            { title: 'Quick Wins', icon: Zap, color: '#00ff9d', items: ['Add HSTS Header', 'Enable CSP', 'Fix Cookie Flags'], tag: 'Easy fixes' },
            { title: 'Trending CVEs', icon: Eye, color: '#8b5cf6', items: ['CVE-2024-1234', 'CVE-2024-5678', 'CVE-2024-9012'], tag: 'This week' },
          ].map((card, i) => (
            <motion.div key={card.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
              className="glass-card p-5 hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}>
                  <card.icon size={15} style={{ color: card.color }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{card.title}</div>
                  <div className="text-xs text-slate-500">{card.tag}</div>
                </div>
              </div>
              <ul className="space-y-2">
                {card.items.map((item, j) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: card.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
