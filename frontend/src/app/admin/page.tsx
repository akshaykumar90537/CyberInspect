'use client'
import { motion } from 'framer-motion'
import { Users, Scan, Activity, AlertTriangle, Shield, Clock, TrendingUp, Database } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const USERS = [
  { name: 'Jane Doe', email: 'jane@acme.com', role: 'admin', scans: 84, status: 'active', joined: '2024-01-12' },
  { name: 'Bob Smith', email: 'bob@corp.io', role: 'analyst', scans: 37, status: 'active', joined: '2024-02-05' },
  { name: 'Alice K.', email: 'alice@startup.dev', role: 'user', scans: 12, status: 'active', joined: '2024-03-18' },
  { name: 'Tom W.', email: 'tom@freelance.net', role: 'user', scans: 5, status: 'inactive', joined: '2024-04-01' },
]

const dailyScans = [
  { d: 'Mon', s: 34 }, { d: 'Tue', s: 58 }, { d: 'Wed', s: 41 },
  { d: 'Thu', s: 76 }, { d: 'Fri', s: 62 }, { d: 'Sat', s: 19 }, { d: 'Sun', s: 43 },
]

const SYS_STATS = [
  { label: 'Total Users', value: '1,847', icon: Users, color: '#00d4ff' },
  { label: 'Total Scans', value: '48,291', icon: Scan, color: '#8b5cf6' },
  { label: 'Active Today', value: '234', icon: Activity, color: '#00ff9d' },
  { label: 'Open Critical', value: '127', icon: AlertTriangle, color: '#ff3d5a' },
]

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Admin Panel" subtitle="System management and analytics" />
      <div className="flex-1 p-6 space-y-6">
        {/* System stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SYS_STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="card p-4 hover:-translate-y-[1px] transition-transform cursor-default group">
              <div className="flex items-center justify-between mb-3">
                <s.icon size={15} style={{ color: s.color }} />
                <TrendingUp size={11} className="text-[#00ff9d]" />
              </div>
              <div className="text-2xl font-bold text-white font-sans tracking-tight">{s.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scan volume chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 card">
            <div className="card-header">
              <h3 className="card-title">Daily Scan Volume</h3>
            </div>
            <div className="card-body !py-2">
              <ResponsiveContainer width="100%" height={165}>
                <BarChart data={dailyScans}>
                  <XAxis dataKey="d" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f1929', border: '1px solid #1a2a45', borderRadius: 8, fontSize: 10 }} />
                  <Bar dataKey="s" name="Scans" fill="#00d4ff" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* System health */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="card">
            <div className="card-header">
              <h3 className="card-title">System Health</h3>
            </div>
            <div className="card-body">
              <div className="space-y-1">
                {[
                  { name: 'API Backend', ok: true },
                  { name: 'PostgreSQL Database', ok: true },
                  { name: 'Redis Cache Server', ok: true },
                  { name: 'ZAP Scanner Daemon', ok: true },
                  { name: 'Celery Workers', ok: false },
                ].map(svc => (
                  <div key={svc.name} className="health-row">
                    <span className="health-name font-medium">{svc.name}</span>
                    <span className={`health-status uppercase font-bold text-[9px] ${svc.ok ? 'text-[#00ff9d]' : 'text-[#ef4444]'}`}>
                      <span className={`health-dot ${svc.ok ? 'bg-[#00ff9d] animate-pulse' : 'bg-[#ef4444]'}`} />
                      {svc.ok ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* User management table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="card overflow-hidden">
          <div className="card-header">
            <h3 className="card-title">User Management</h3>
            <button className="text-[10px] font-bold uppercase tracking-wider text-[#00d4ff] hover:text-cyan-300">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="hidden sm:table-cell">Scans</th>
                  <th className="hidden md:table-cell">Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u, i) => (
                  <tr key={u.email} className="cursor-pointer">
                    <td>
                      <div className="font-bold text-white text-xs">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'admin' ? 'badge-critical' :
                        u.role === 'analyst' ? 'badge-info' : 'badge-pending'
                      }`}>{u.role}</span>
                    </td>
                    <td className="hidden sm:table-cell text-slate-300 font-mono">{u.scans}</td>
                    <td className="hidden md:table-cell text-slate-500 font-mono">{u.joined}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-completed' : 'badge-pending'}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
