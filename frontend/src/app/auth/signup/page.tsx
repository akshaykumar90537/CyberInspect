'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Loader2, Check } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      localStorage.setItem('access_token', data.access_token)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto px-6 py-12">
      <div className="glass-card glow-border p-8 rounded-2xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl">CyberInspect <span className="glow-text">AI</span></span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-slate-400 text-sm mb-8">Start scanning for free — no credit card required</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/40 text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required
              className="w-full bg-[#0b1120] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
              className="w-full bg-[#0b1120] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full bg-[#0b1120] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex gap-3">
                {checks.map(c => (
                  <span key={c.label} className={`flex items-center gap-1 text-xs ${c.ok ? 'text-green-400' : 'text-slate-500'}`}>
                    <Check size={10} className={c.ok ? 'opacity-100' : 'opacity-30'} /> {c.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Sign in</Link>
        </p>
      </div>
    </motion.div>
  )
}
