'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Bot, User, Loader2, Shield, Zap, Code2, AlertTriangle } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'

type Message = { role: 'user' | 'assistant'; content: string; id: string }

const QUICK_PROMPTS = [
  { icon: AlertTriangle, label: 'Explain SQL Injection', prompt: 'Explain SQL injection vulnerabilities and how to fix them with code examples.' },
  { icon: Shield, label: 'XSS Prevention', prompt: 'How do I prevent Cross-Site Scripting (XSS) attacks in my web application?' },
  { icon: Zap, label: 'Security Headers', prompt: 'What are the most important HTTP security headers I should implement and why?' },
  { icon: Code2, label: 'Secure Cookie Setup', prompt: 'Show me how to set secure, HttpOnly, SameSite cookies in Node.js and Python.' },
]

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-blue-600/20 border border-blue-500/20 text-slate-200 rounded-tr-sm'
          : 'glass-card border-cyan-500/10 text-slate-200 rounded-tl-sm'
      }`}>
        {/* Render markdown-like content */}
        <div className="prose prose-invert prose-sm max-w-none">
          {msg.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h3 key={i} className="text-white font-bold text-sm mt-2 mb-1">{line.slice(3)}</h3>
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="text-white">{line.slice(2, -2)}</strong>
            if (line.startsWith('- ')) return <li key={i} className="ml-3 list-disc text-slate-300">{line.slice(2)}</li>
            if (line.startsWith('```')) return <div key={i} className="font-mono text-xs bg-[#060912] rounded px-2 py-1 my-1 text-cyan-300">{line.slice(3)}</div>
            return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `## Welcome to CyberInspect AI Assistant

I'm your dedicated cybersecurity expert. I can help you:

- Understand vulnerabilities found in your scans
- Explain attack vectors and exploitation techniques
- Provide specific code-level remediation examples
- Answer questions about OWASP, CVEs, and security standards
- Prioritize which vulnerabilities to fix first

What security question can I help you with today? [High confidence]`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text || input.trim()
    if (!content || loading) return

    setInput('')
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.message || 'I encountered an error. Please try again.'
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply }])
    } catch {
      // Fallback response
      const fallbacks: Record<string, string> = {
        'xss': '## Cross-Site Scripting (XSS)\n\nXSS allows attackers to inject scripts into pages. Fix it by:\n\n- HTML-encoding all user output: `element.textContent = input` not `innerHTML`\n- Implementing Content-Security-Policy header\n- Using DOMPurify for sanitizing HTML\n- Setting X-XSS-Protection: 1; mode=block\n\n[High confidence]',
        'sql': '## SQL Injection\n\nNever concatenate user input into SQL. Use:\n\n```python\ncursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))\n```\n\nOr use an ORM like SQLAlchemy. Also enable a WAF as defense-in-depth. [High confidence]',
        'header': '## Security Headers Quick Reference\n\n- `Strict-Transport-Security: max-age=31536000` — Force HTTPS\n- `Content-Security-Policy: default-src \'self\'` — Prevent XSS\n- `X-Frame-Options: DENY` — Prevent clickjacking\n- `X-Content-Type-Options: nosniff` — Prevent MIME sniffing\n- `Referrer-Policy: strict-origin-when-cross-origin`\n\n[High confidence]',
      }
      const key = Object.keys(fallbacks).find(k => content.toLowerCase().includes(k))
      const reply = fallbacks[key ?? ''] || `Great question about "${content.slice(0, 30)}...". I'm here to help with all web security topics — try asking about specific vulnerability types, OWASP Top 10, or request code examples for remediation. [Medium confidence]`
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="AI Security Assistant" subtitle="Powered by GPT-4 · Cybersecurity expert" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={14} className="text-cyan-400 animate-spin" />
                <span className="text-sm text-slate-400">Analyzing...</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map(qp => (
              <button key={qp.label} onClick={() => sendMessage(qp.prompt)}
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-[#1a2a45] hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all">
                <qp.icon size={12} />
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-[#1a2a45] bg-[#0b1120]/80 backdrop-blur-md">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 flex items-end gap-2 bg-[#0f1929] border border-[#1a2a45] focus-within:border-cyan-500/40 rounded-xl px-4 py-3 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask about vulnerabilities, security best practices, OWASP..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none resize-none max-h-32"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/25 shrink-0">
              <Send size={15} className="text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">
            AI may produce inaccurate information. Always verify security advice with a qualified professional.
          </p>
        </div>
      </div>
    </div>
  )
}
