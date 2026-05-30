'use client'
import { Bell, Search, Zap } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import BackendStatus from '@/components/ui/BackendStatus'

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [search, setSearch] = useState('')

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#0f1f35] bg-[#080d1a] sticky top-0 z-30 h-[54px]">
      <div>
        <h1 className="text-sm font-bold text-white tracking-wide">{title}</h1>
        {subtitle && <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Backend connection status */}
        <BackendStatus />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#0f1929] border border-[#1a2a45] rounded-lg px-3 py-1.5 w-48 focus-within:border-[rgba(0,212,255,0.4)] transition-all">
          <Search size={13} className="text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scans, reports…"
            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>

        {/* Quick scan */}
        <Link href="/scanner"
          className="flex items-center gap-1.5 bg-gradient-to-r from-[rgba(6,182,212,0.12)] to-[rgba(59,130,246,0.12)] hover:from-[rgba(6,182,212,0.22)] hover:to-[rgba(59,130,246,0.22)] border border-[rgba(6,182,212,0.3)] text-[#00d4ff] px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all">
          <Zap size={12} />
          <span className="hidden sm:inline">⚡ New Scan</span>
        </Link>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a2a45] hover:border-[rgba(0,212,255,0.3)] text-slate-500 hover:text-[#00d4ff] transition-all">
          <Bell size={14} />
          <span className="absolute top-2 right-2 w-1 h-1 bg-[#ef4444] rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold cursor-pointer">
          JD
        </div>
      </div>
    </header>
  )
}
