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
      className="relative flex flex-col h-screen bg-[#0b1120] border-r border-[#1a2a45] shrink-0 overflow-hidden z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1a2a45]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
              className="font-bold text-base text-white whitespace-nowrap overflow-hidden">
              CyberInspect <span className="glow-text">AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Scan status indicator */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-3 mt-3 px-3 py-2 rounded-lg bg-green-950/30 border border-green-800/30 flex items-center gap-2">
            <Activity size={12} className="text-green-400 animate-pulse" />
            <span className="text-xs text-green-400">All systems operational</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative
                  ${active
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}>
                {active && (
                  <motion.div layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-400 rounded-r-full" />
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
      <div className="p-3 border-t border-[#1a2a45] space-y-1">
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-medium">Sign out</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#0b1120] border border-[#1a2a45] rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all z-50">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
