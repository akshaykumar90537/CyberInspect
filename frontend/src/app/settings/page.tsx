'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Key, Bell, Shield, Save, Loader2 } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('Jane Doe')
  const [email, setEmail] = useState('jane@company.com')

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
  }

  const sections = [
    {
      id: 'profile', icon: User, title: 'Profile',
      content: (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="form-input" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security', icon: Key, title: 'Security',
      content: (
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" placeholder="••••••••"
              className="form-input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" placeholder="••••••••"
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" placeholder="••••••••"
                className="form-input" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#0f2040]">
            <div>
              <div className="text-sm font-medium text-white">Two-Factor Authentication (2FA)</div>
              <div className="text-xs text-slate-500">Provide secondary verification codes upon signing in</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all font-semibold uppercase tracking-wide">
              Enable 2FA
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'notifications', icon: Bell, title: 'Notifications',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Critical vulnerability found', desc: 'Email alert when a critical vulnerability is flagged', enabled: true },
            { label: 'Scanner run complete', desc: 'Notify when crawler path audits finish scanning', enabled: true },
            { label: 'Weekly security posture digest', desc: 'Auto-compiled performance audit sheets and reports', enabled: false },
          ].map(n => (
            <div key={n.label} className="toggle-wrap">
              <div>
                <div className="text-sm font-medium text-white">{n.label}</div>
                <div className="text-xs text-slate-500">{n.desc}</div>
              </div>
              <div className={`toggle ${n.enabled ? 'on' : 'off'}`}>
                <div className="toggle-thumb" />
              </div>
            </div>
          ))}
        </div>
      )
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="Settings" subtitle="Manage your account and preferences" />
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-4">
        {sections.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-[#0f2040] pb-3">
              <s.icon size={15} className="text-[#00d4ff]" />
              <h2 className="font-bold text-white uppercase tracking-wider text-xs">{s.title}</h2>
            </div>
            {s.content}
          </motion.div>
        ))}

        <div className="flex justify-end">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}
