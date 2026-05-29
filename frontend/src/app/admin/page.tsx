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
              className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <s.icon size={16} style={{ color: s.color }} />
                <TrendingUp size={12} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Scan volume chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Daily Scan Volume</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyScans}>
                <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f1929', border: '1px solid #1a2a45', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="s" name="Scans" fill="#00d4ff" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* System health */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
              {[
                { name: 'API Backend', ok: true },
                { name: 'PostgreSQL', ok: true },
                { name: 'Redis Cache', ok: true },
                { name: 'ZAP Scanner', ok: true },
                { name: 'Celery Workers', ok: false },
              ].map(svc => (
                <div key={svc.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{svc.name}</span>
                  <span className={`flex items-center gap-1.5 text-xs ${svc.ok ? 'text-green-400' : 'text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${svc.ok ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    {svc.ok ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* User management table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#1a2a45]">
            <h3 className="font-semibold text-white text-sm">User Management</h3>
            <button className="text-xs text-cyan-400 hover:text-cyan-300">View all →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a2a45] text-xs text-slate-500">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">Scans</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {USERS.map((u, i) => (
                  <tr key={u.email} className="border-b border-[#1a2a45]/40 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        u.role === 'admin' ? 'text-purple-400 border-purple-500/30 bg-purple-950/30' :
                        u.role === 'analyst' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30' :
                        'text-slate-400 border-[#1a2a45]'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell text-slate-300 font-mono">{u.scans}</td>
                    <td className="px-5 py-3 hidden md:table-cell text-slate-400 text-xs">{u.joined}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs flex items-center gap-1.5 ${u.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-400' : 'bg-slate-600'}`} />
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
