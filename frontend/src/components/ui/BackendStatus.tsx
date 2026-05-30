/**
 * BackendStatus — shows a small indicator in the topbar
 * telling whether the frontend is connected to the backend.
 *
 * Green dot  = backend reachable at localhost:8000
 * Red dot    = backend not running or wrong port
 */
'use client'
import { useEffect, useState } from 'react'
import { checkBackendHealth } from '@/lib/api'

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    const check = async () => {
      const ok = await checkBackendHealth()
      setStatus(ok ? 'online' : 'offline')
    }
    check()
    // Re-check every 30 seconds
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [])

  if (status === 'checking') return null

  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full border ${
      status === 'online'
        ? 'text-[#00ff9d] bg-[rgba(0,255,157,0.03)] border-[rgba(0,255,157,0.15)]'
        : 'text-[#ef4444] bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'online' ? 'bg-[#00ff9d] animate-pulse' : 'bg-[#ef4444]'
      }`} />
      {status === 'online' ? 'Backend connected' : 'Backend offline'}
    </div>
  )
}
