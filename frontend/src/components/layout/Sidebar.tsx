'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield, LayoutDashboard, Scan, FileText, MessageSquare,
  Settings, Users, ChevronLeft, ChevronRight, LogOut,
  Bell, Activity, Zap
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scanner', icon: Scan, label: 'Scanner' },
  { href: '/reports', icon: FileText, label: 'Reports' },
  { href: '/ai-assistant', icon: MessageSquare, label: 'AI Assistant' },
  { href: '/admin', icon: Users, label: 'Admin Panel' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen bg-[#080d1a] border-r border-[#0f1f35] shrink-0 overflow-hidden z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#0f1f35]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <Shield size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
              className="font-bold text-base text-white whitespace-nowrap overflow-hidden">
              CyberInspect <span className="text-[#00d4ff] glow-text">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Scan status indicator */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[rgba(0,255,157,0.03)] border border-[rgba(0,255,157,0.15)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse shrink-0" />
            <span className="text-[10px] text-[#00ff9d] font-semibold tracking-wide uppercase">All systems operational</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative border
                  ${active
                    ? 'text-[#00d4ff] bg-gradient-to-r from-[rgba(0,212,255,0.07)] to-[rgba(0,212,255,0.02)] border-[rgba(0,212,255,0.15)]'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}>
                {active && (
                  <motion.div layoutId="activeIndicator"
                    className="absolute left-0 top-50 w-0.5 h-6 bg-[#00d4ff] rounded-r-full" />
                )}
                <item.icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#0f1929] border border-[#1a2a45] rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[#0f1f35]">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group relative ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate">Jane Doe</div>
              <div className="text-[10px] text-slate-500 truncate">Security Analyst</div>
            </div>
          )}
          {!collapsed && (
            <button className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors" title="Sign Out">
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#080d1a] border border-[#0f1f35] rounded-full flex items-center justify-center text-slate-400 hover:text-[#00d4ff] hover:border-[rgba(0,212,255,0.3)] transition-all z-50">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
