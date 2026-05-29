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
    <header className="flex items-center justify-between px-6 py-3 border-b border-[#1a2a45] bg-[#0b1120]/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="text-base font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Backend connection status */}
        <BackendStatus />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#0f1929] border border-[#1a2a45] rounded-lg px-3 py-2 w-48 focus-within:border-cyan-500/40 transition-all">
          <Search size={13} className="text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search scans..."
            className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
          />
        </div>

        {/* Quick scan */}
        <Link href="/scanner"
          className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
          <Zap size={13} />
          <span className="hidden sm:inline">New Scan</span>
        </Link>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-[#1a2a45] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold cursor-pointer">
          JD
        </div>
      </div>
    </header>
  )
}
