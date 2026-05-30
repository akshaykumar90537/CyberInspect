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
      className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse self-end ml-auto' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,212,255,0.2)] ${
        isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed border ${
        isUser
          ? 'bg-[#1e1b4b80] border-[#312e8160] text-slate-200 rounded-tr-none'
          : 'bg-[#0c1526] border-[#0f2040] text-slate-200 rounded-tl-none'
      }`}>
        {/* Render markdown-like content */}
        <div className="prose prose-invert prose-sm max-w-none">
          {msg.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h3 key={i} className="text-white font-bold text-xs mt-2 mb-1 uppercase tracking-wide border-b border-[#0f2040] pb-1">{line.slice(3)}</h3>
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="text-white font-semibold">{line.slice(2, -2)}</strong>
            if (line.startsWith('- ')) return <li key={i} className="ml-3 list-disc text-slate-400 font-medium mb-0.5">{line.slice(2)}</li>
            if (line.startsWith('```')) return <div key={i} className="font-mono text-[10px] bg-[#04080f] border border-[#0f2040] rounded px-2 py-1.5 my-1.5 text-cyan-300 overflow-x-auto leading-relaxed">{line.slice(3)}</div>
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

      <div className="flex-1 flex flex-col overflow-hidden bg-[#060912]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-[#0c1526] border border-[#0f2040] rounded-xl rounded-tl-none p-1 flex items-center">
                <div className="typing-indicator select-none">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
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
                className="qp">
                <qp.icon size={11} className="text-[#00d4ff]" />
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-[#0f1f35] bg-[#080d1a]">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 flex items-end gap-2 bg-[#0c1526] border border-[#0f2040] focus-within:border-[rgba(0,212,255,0.3)] rounded-xl px-4 py-2.5 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask about vulnerabilities, security best practices, OWASP..."
                rows={1}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none resize-none max-h-32 leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/25 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Send size={13} className="text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2 font-mono">
            AI may produce inaccurate information. Always verify security advice with a qualified professional.
          </p>
        </div>
      </div>
    </div>
  )
}
