'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
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

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
            <p className="text-slate-400 text-sm mb-8">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" required
                  className="w-full bg-[#0b1120] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm transition-all"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm mb-6">
              We sent a reset link to <span className="text-cyan-400">{email}</span>
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
