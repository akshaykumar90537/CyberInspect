'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.auth.login(email, password)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your email and password.')
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
          <span className="font-bold text-xl text-white">CyberInspect <span className="glow-text">AI</span></span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-slate-400 text-sm mb-8">Sign in to your security dashboard</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/40 text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required autoComplete="email"
              className="w-full bg-[#0b1120] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                className="w-full bg-[#0b1120] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-600 text-sm transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{' '}
          <Link href="/auth/signup" className="text-cyan-400 hover:text-cyan-300 font-medium">Create one free</Link>
        </p>
      </div>
    </motion.div>
  )
}
