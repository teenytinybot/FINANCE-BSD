'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

const NAVY   = '#0D1B3E'
const VIOLET = '#6366F1'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F8FC' }}>

      {/* ── Left panel — navy→violet gradient ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1e2a5e 50%, #2d1b69 100%)`, position: 'relative', overflow: 'hidden' }}
      >
        {/* Glow blob */}
        <div style={{ position: 'absolute', top: '15%', right: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <span className="font-black text-white" style={{ fontSize: '12px' }}>B</span>
          </div>
          <span className="text-sm text-white">bite<strong>speed</strong> <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Finance</span></span>
        </div>

        {/* Content */}
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Internal dashboard</p>
          <h2 className="text-white font-bold leading-[1.1] mb-5" style={{ fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
            Manage invoices,<br />
            payments &<br />
            reconciliation.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            A single place for the BitSpeed finance team to track every rupee — from invoice to receipt.
          </p>
          <div className="space-y-3">
            {[
              'Invoice & payment tracking',
              'Bank reconciliation',
              'AR aging & churn alerts',
              'TDS & compliance uploads',
              'Ledger download & export',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <CheckCircle2 size={14} style={{ color: '#A5B4FC', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} BitSpeed · Internal use only</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
              <span className="text-white font-black" style={{ fontSize: '11px' }}>B</span>
            </div>
            <span className="font-semibold text-sm">bite<strong>speed</strong> <span style={{ color: '#9CA3AF', fontWeight: 400 }}>Finance</span></span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Sign in</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            Finance team access only. <Link href="/" className="underline underline-offset-2" style={{ color: VIOLET }}>How it works →</Link>
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Email address</label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                defaultValue="finance@bitespeed.co"
                placeholder="finance@bitespeed.co"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm pr-10 transition-all"
                  style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--subtle)' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <div className="px-3.5 py-2.5 rounded-xl text-xs"
                style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #FECACA' }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 mt-2"
              style={{ background: VIOLET, color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
            >
              {pending ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--subtle)' }}>
            Not a finance team member?{' '}
            <Link href="/" className="underline underline-offset-2" style={{ color: 'var(--muted)' }}>
              Learn how finance works
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
