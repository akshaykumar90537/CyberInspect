'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  Shield, Zap, Brain, BarChart3, FileText, Lock,
  ChevronRight, Check, Star, Globe, Terminal,
  AlertTriangle, Activity, Eye, Code2, ArrowRight, X
} from 'lucide-react'

const FEATURES = [
  { icon: Zap, title: 'Real-Time Scanning', desc: 'Live WebSocket feed shows every test as it runs. Watch vulnerabilities surface in milliseconds.', color: '#00d4ff' },
  { icon: Brain, title: 'AI Risk Analysis', desc: 'GPT-4 powered assistant explains every finding, assigns CVSS scores, and prioritizes your fix list.', color: '#8b5cf6' },
  { icon: Shield, title: 'OWASP Top 10', desc: 'Comprehensive coverage: SQLi, XSS, CSRF, IDOR, SSRF, XXE, broken auth, and more.', color: '#00ff9d' },
  { icon: Globe, title: 'Threat Visualization', desc: 'Interactive attack maps, severity heatmaps, and network topology diagrams.', color: '#ff8c42' },
  { icon: FileText, title: 'PDF Reports', desc: 'Board-ready executive summaries and technical deep-dives with remediation steps, auto-generated.', color: '#ff3d5a' },
  { icon: Terminal, title: 'Live Terminal UI', desc: 'Hacker-style terminal output streams every scan action. Know exactly what the scanner is doing.', color: '#ffb800' },
]

const VULNS = [
  { name: 'SQL Injection', severity: 'critical', cvss: '9.8' },
  { name: 'Cross-Site Scripting', severity: 'high', cvss: '7.4' },
  { name: 'Missing HSTS Header', severity: 'high', cvss: '7.5' },
  { name: 'CORS Misconfiguration', severity: 'critical', cvss: '9.1' },
  { name: 'Weak TLS Version', severity: 'high', cvss: '7.4' },
  { name: 'Open Redirect', severity: 'medium', cvss: '6.1' },
]

const PRICING = [
  { name: 'Free', price: 0, scans: '5 scans/mo', features: ['Quick scan only', '10 vulnerability checks', 'Email report', 'Community support'], popular: false },
  { name: 'Pro', price: 49, scans: '50 scans/mo', features: ['Full + deep scans', '50+ vulnerability checks', 'PDF reports', 'AI assistant', 'API access', 'Priority support'], popular: true },
  { name: 'Enterprise', price: 199, scans: 'Unlimited', features: ['Everything in Pro', 'Custom scan policies', 'SSO / LDAP', 'SIEM integration', 'SLA guarantee', 'Dedicated support'], popular: false },
]

const FAQS = [
  { q: 'Is CyberInspect AI safe to use on production sites?', a: 'Yes. Our scanner is passive-first and never performs destructive operations. We use safe, non-intrusive probes. Always obtain proper authorization before scanning any site you don\'t own.' },
  { q: 'How accurate are the vulnerability detections?', a: 'Our AI-assisted engine achieves <5% false positive rate on tested domains. Every finding includes evidence and confidence scores so you can quickly verify results.' },
  { q: 'What scanning tools does CyberInspect use?', a: 'We combine OWASP ZAP, custom HTTP crawlers, Nmap for port scanning, SSLyze for TLS analysis, and our proprietary AI engine for risk scoring.' },
  { q: 'Can I integrate CyberInspect into my CI/CD pipeline?', a: 'Yes. Our REST API and CLI tool let you trigger scans programmatically. Set security gates that fail builds when critical vulnerabilities are detected.' },
]

const severityColor = (s: string) => ({
  critical: 'text-red-400 bg-red-950/50 border-red-800/40',
  high: 'text-orange-400 bg-orange-950/50 border-orange-800/40',
  medium: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/40',
  low: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/40',
}[s] ?? '')

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scanUrl, setScanUrl] = useState('')

  return (
    <div className="min-h-screen bg-[#060912] text-slate-200 overflow-x-hidden">
      {/* ── NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass border-b border-[#1a2a45]/60">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CyberInspect <span className="glow-text">AI</span></span>
        </motion.div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          {['Features', 'Pricing', 'Docs', 'Blog'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="hover:text-cyan-400 transition-colors cursor-pointer">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login"
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/signup"
            className="text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 cyber-grid-bg opacity-40" />
        <motion.div style={{ y }} className="absolute inset-0 bg-radial-glow opacity-60" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 bg-cyan-500/40 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glow-border text-sm text-cyan-400 mb-8">
              <Activity size={14} className="animate-pulse" />
              AI-powered · Real-time · OWASP Compliant
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Find vulnerabilities
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                before attackers do
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              CyberInspect AI scans your web applications for security vulnerabilities in minutes.
              AI-powered analysis, real-time terminal output, and actionable remediation guidance.
            </p>

            {/* Inline scanner */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
              <input
                value={scanUrl}
                onChange={e => setScanUrl(e.target.value)}
                placeholder="https://your-website.com"
                className="flex-1 bg-[#0f1929] border border-[#1a2a45] focus:border-cyan-500/50 focus:outline-none rounded-xl px-5 py-4 text-white placeholder-slate-500 transition-all"
              />
              <Link href="/auth/signup"
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-xl hover:shadow-cyan-500/30 whitespace-nowrap">
                Start Scan <ChevronRight size={16} />
              </Link>
            </div>

            <p className="text-sm text-slate-500">No credit card required · 5 free scans/month</p>
          </motion.div>

          {/* Mock scan results preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 glass-card border border-[#1a2a45] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-5 py-3 bg-[#0b1120] border-b border-[#1a2a45]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-slate-500 font-mono">cyberinspect-ai — scan https://demo.target.com</span>
            </div>
            <div className="p-6 font-mono text-sm text-left space-y-1">
              {[
                { t: '[*] Starting CyberInspect AI scan engine...', c: 'text-cyan-400' },
                { t: '[+] Target: https://demo.target.com | Type: Full', c: 'text-slate-400' },
                { t: '[*] Checking 7 security headers...', c: 'text-cyan-400' },
                { t: '[!] MISSING: Strict-Transport-Security (HSTS)', c: 'text-yellow-400' },
                { t: '[!] MISSING: Content-Security-Policy', c: 'text-orange-400' },
                { t: '[*] Crawling 34 URLs... Discovering forms...', c: 'text-cyan-400' },
                { t: '[!!!] CRITICAL: Reflected XSS in /search?q= [CVSS 7.4]', c: 'text-red-400' },
                { t: '[!!!] CRITICAL: SQL Injection in /api/users?id= [CVSS 9.8]', c: 'text-red-400' },
                { t: '[+] Scan complete. 11 findings. Grade: D | Score: 42/100', c: 'text-green-400' },
              ].map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }} className={line.c}>
                  {line.t}
                </motion.div>
              ))}
              <motion.span
                animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                className="text-cyan-400">█</motion.span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[#1a2a45]/60 bg-[#0b1120]/80 py-8">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '50K+', l: 'Scans completed' },
            { v: '2.3M', l: 'Vulnerabilities found' },
            { v: '99.2%', l: 'Detection accuracy' },
            { v: '<60s', l: 'Avg scan time' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="text-3xl font-bold glow-text mb-1">{v}</div>
              <div className="text-sm text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to secure your app
          </h2>
          <p className="text-slate-400 text-lg">
            From automated scanning to AI-powered analysis — all in one platform.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              className="glass-card p-6 hover:border-opacity-30 group transition-all hover:scale-[1.02]"
              style={{ '--hover-color': f.color } as React.CSSProperties}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── VULNERABILITY SHOWCASE ── */}
      <section className="py-20 bg-[#0b1120]/60 border-y border-[#1a2a45]/40">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                50+ vulnerability checks
                <br /><span className="glow-text">out of the box</span>
              </h2>
              <p className="text-slate-400 mb-6">
                CyberInspect AI covers the OWASP Top 10 and goes beyond. Every vulnerability
                includes CVSS scoring, exploit probability, and specific remediation steps.
              </p>
              <Link href="/auth/signup"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm">
                Start scanning for free <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {VULNS.map((v, i) => (
                <motion.div key={v.name}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                  className="flex items-center justify-between p-3 glass rounded-lg border border-[#1a2a45]/60">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={14} className="text-slate-500" />
                    <span className="text-sm text-slate-300">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono ${severityColor(v.severity)}`}>
                      {v.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">CVSS {v.cvss}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-slate-400">Scale as you grow. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((plan, i) => (
            <motion.div key={plan.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className={`glass-card p-6 relative ${plan.popular ? 'border-cyan-500/30 glow-border' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xs font-bold text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <div className="text-slate-400 text-sm mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-slate-500">/mo</span>}
                </div>
                <div className="text-sm text-cyan-400 mt-1">{plan.scans}</div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={14} className="text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup"
                className={`block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'border border-[#1a2a45] text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400'
                }`}>
                {plan.price === 0 ? 'Start for free' : 'Get started'}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 max-w-2xl mx-auto px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-xl border border-[#1a2a45]/60 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
                <span className="font-medium text-slate-200 pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <X size={16} className="text-slate-500 shrink-0" />
                </motion.div>
              </button>
              {openFaq === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}
                  className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-[#1a2a45]/40 pt-4">
                  {faq.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-8">
        <div className="max-w-2xl mx-auto text-center glass-card glow-border p-12 rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6">
            <Shield size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Start securing your apps today</h2>
          <p className="text-slate-400 mb-8">
            Join thousands of developers and security teams who trust CyberInspect AI
            to keep their applications safe.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-xl hover:shadow-cyan-500/30">
            Get started for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1a2a45]/60 py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-cyan-400" />
            <span className="font-bold">CyberInspect AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 CyberInspect AI. Built for security professionals.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300">Privacy</a>
            <a href="#" className="hover:text-slate-300">Terms</a>
            <a href="#" className="hover:text-slate-300">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
