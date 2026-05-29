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
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-[#060912] border border-[#1a2a45] focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="w-full bg-[#060912] border border-[#1a2a45] focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm transition-all" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security', icon: Key, title: 'Security',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••"
              className="w-full bg-[#060912] border border-[#1a2a45] focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm transition-all" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">New Password</label>
              <input type="password" placeholder="••••••••"
                className="w-full bg-[#060912] border border-[#1a2a45] focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Confirm Password</label>
              <input type="password" placeholder="••••••••"
                className="w-full bg-[#060912] border border-[#1a2a45] focus:border-cyan-500/40 focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#1a2a45]">
            <div>
              <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
              <div className="text-xs text-slate-500">Add an extra layer of security to your account</div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all">
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
            { label: 'Critical vulnerability found', desc: 'Email when a critical severity issue is detected', enabled: true },
            { label: 'Scan completed', desc: 'Notify when a scan finishes', enabled: true },
            { label: 'Weekly security digest', desc: 'Weekly summary of your security posture', enabled: false },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border border-[#1a2a45]">
              <div>
                <div className="text-sm font-medium text-white">{n.label}</div>
                <div className="text-xs text-slate-500">{n.desc}</div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${n.enabled ? 'bg-cyan-500' : 'bg-[#1a2a45]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white m-0.5 transition-transform ${n.enabled ? 'translate-x-5' : ''}`} />
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
            className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <s.icon size={16} className="text-cyan-400" />
              <h2 className="font-semibold text-white">{s.title}</h2>
            </div>
            {s.content}
          </motion.div>
        ))}

        <div className="flex justify-end">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all">
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}
