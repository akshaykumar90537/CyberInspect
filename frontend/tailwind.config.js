/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cyber dark palette
        cyber: {
          bg: '#060912',
          surface: '#0b1120',
          card: '#0f1929',
          border: '#1a2a45',
          glow: '#00d4ff',
          green: '#00ff9d',
          red: '#ff3d5a',
          yellow: '#ffb800',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40L40 0' stroke='%231a2a45' stroke-width='0.5'/%3E%3C/svg%3E\")",
        'radial-glow': 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'matrix': 'matrix 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
