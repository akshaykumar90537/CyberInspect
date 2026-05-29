/**
 * CyberInspect AI — API Client
 *
 * HOW IT WORKS LOCALLY:
 * ─────────────────────
 * Frontend runs on  → http://localhost:3000
 * Backend runs on   → http://localhost:8000
 *
 * All API calls go to /api/v1/... (relative URL, no hardcoded host).
 * Next.js rewrites proxy those to http://localhost:8000/api/v1/...
 * This means NO CORS errors, even in local development.
 *
 * WebSockets connect directly to ws://localhost:8000/ws/scan/{id}
 * because Next.js cannot proxy WebSocket connections.
 */

// ─── Base URLs ─────────────────────────────────────────────────────────────
// REST: use relative path → Next.js proxy handles it → no CORS
const API_BASE = '/api/v1'

// WebSocket: must connect directly to backend (Next.js can't proxy WS)
const WS_BASE = (
  process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
).replace(/^http/, 'ws')


// ─── Token helpers ─────────────────────────────────────────────────────────
const getToken  = () => (typeof window !== 'undefined' ? localStorage.getItem('access_token')  : null)
const getRefresh= () => (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null)
const saveTokens= (access: string, refresh: string) => {
  localStorage.setItem('access_token',  access)
  localStorage.setItem('refresh_token', refresh)
}
export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}


// ─── Core request function ─────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // ── Auto-refresh on 401 ──────────────────────────────────────────────────
  if (res.status === 401) {
    const refresh = getRefresh()
    if (refresh) {
      try {
        const rr = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refresh }),
        })
        if (rr.ok) {
          const data = await rr.json()
          saveTokens(data.access_token, data.refresh_token)
          // Retry the original request with the new token
          return request<T>(path, options)
        }
      } catch { /* refresh failed */ }
    }
    clearTokens()
    if (typeof window !== 'undefined') window.location.href = '/auth/login'
    throw new Error('Session expired. Please log in again.')
  }

  // ── Error handling ───────────────────────────────────────────────────────
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const err = await res.json()
      message = err.detail || err.message || message
    } catch { /* ignore parse error */ }
    throw new Error(message)
  }

  // ── Empty response (e.g. 204 No Content) ────────────────────────────────
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}


// ─── Typed API methods ─────────────────────────────────────────────────────
export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────
  auth: {
    register: (email: string, full_name: string, password: string) =>
      request<{ access_token: string; refresh_token: string }>(
        '/auth/register', { method: 'POST', body: JSON.stringify({ email, full_name, password }) }
      ),

    login: (email: string, password: string) =>
      request<{ access_token: string; refresh_token: string }>(
        '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),

    refresh: (refresh_token: string) =>
      request<{ access_token: string; refresh_token: string }>(
        '/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }
      ),

    me: () => request<any>('/auth/me'),
  },

  // ── Scans ───────────────────────────────────────────────────────────────
  scans: {
    create: (target_url: string, scan_type = 'full', options = {}) =>
      request<any>('/scans/', {
        method: 'POST',
        body: JSON.stringify({ target_url, scan_type, options }),
      }),

    list: (skip = 0, limit = 20) =>
      request<any[]>(`/scans/?skip=${skip}&limit=${limit}`),

    get: (id: string) =>
      request<any>(`/scans/${id}`),

    delete: (id: string) =>
      request<void>(`/scans/${id}`, { method: 'DELETE' }),
  },

  // ── Reports ─────────────────────────────────────────────────────────────
  reports: {
    list: () => request<any[]>('/reports/'),

    generate: (scan_id: string) =>
      request<any>(`/reports/${scan_id}/generate`, { method: 'POST' }),

    download: (report_id: string) =>
      `${API_BASE}/reports/${report_id}/download`,   // direct link for <a href>

    delete: (report_id: string) =>
      request<void>(`/reports/${report_id}`, { method: 'DELETE' }),
  },

  // ── AI Assistant ────────────────────────────────────────────────────────
  ai: {
    chat: (messages: { role: string; content: string }[], scan_id?: string) =>
      request<{ message: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, scan_id }),
      }),
  },

  // ── Admin ────────────────────────────────────────────────────────────────
  admin: {
    stats:   () => request<any>('/admin/stats'),
    users:   (skip = 0, limit = 50) => request<any[]>(`/admin/users?skip=${skip}&limit=${limit}`),
    setRole: (user_id: string, role: string) =>
      request<any>(`/admin/users/${user_id}/role?role=${role}`, { method: 'PATCH' }),
    deactivate: (user_id: string) =>
      request<any>(`/admin/users/${user_id}/deactivate`, { method: 'PATCH' }),
  },
}


// ─── WebSocket: Real-time scan log streaming ──────────────────────────────
/**
 * Creates a WebSocket connection directly to the backend.
 * Next.js proxy cannot handle WebSockets, so we connect directly.
 *
 * Usage:
 *   const ws = createScanSocket(scanId, (msg) => console.log(msg))
 *   // msg = { level: 'info'|'warning'|'error'|'success', message: '...', progress: 0-100 }
 *   ws.close() // when done
 */
export function createScanSocket(
  scanId: string,
  onMessage: (data: { level: string; message: string; progress?: number }) => void,
  onClose?: () => void,
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/scan/${scanId}`)

  ws.onopen = () => {
    console.log(`[CyberInspect WS] Connected to scan ${scanId}`)
    // Keep-alive ping every 30s
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping')
      else clearInterval(ping)
    }, 30_000)
  }

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      if (data.type !== 'pong') onMessage(data)
    } catch { /* ignore malformed messages */ }
  }

  ws.onerror = (err) => console.error('[CyberInspect WS] Error:', err)

  ws.onclose = () => {
    console.log(`[CyberInspect WS] Disconnected from scan ${scanId}`)
    onClose?.()
  }

  return ws
}


// ─── Health check — test if backend is reachable ──────────────────────────
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}
