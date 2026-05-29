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
    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
      status === 'online'
        ? 'text-green-400 bg-green-950/30 border-green-800/30'
        : 'text-red-400 bg-red-950/30 border-red-800/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
      }`} />
      {status === 'online' ? 'Backend connected' : 'Backend offline'}
      {status === 'offline' && (
        <span className="ml-1 text-red-300/70">— run uvicorn</span>
      )}
    </div>
  )
}
