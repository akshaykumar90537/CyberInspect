import type { NextConfig } from 'next'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  // For local dev — no standalone output needed
  images: {
    domains: ['lh3.googleusercontent.com'],
  },

  /**
   * API Proxy: any request from the browser to /api/* or /ws/*
   * gets forwarded to the FastAPI backend at localhost:8000.
   * This means the frontend NEVER has CORS issues — everything
   * goes through Next.js as a proxy.
   */
  async rewrites() {
    return [
      // REST API
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      // WebSocket (handled separately in the browser via createScanSocket)
      {
        source: '/ws/:path*',
        destination: `${BACKEND_URL}/ws/:path*`,
      },
      // API docs (optional — lets you view /docs from localhost:3000)
      {
        source: '/docs',
        destination: `${BACKEND_URL}/docs`,
      },
      {
        source: '/health',
        destination: `${BACKEND_URL}/health`,
      },
    ]
  },
}

export default nextConfig
