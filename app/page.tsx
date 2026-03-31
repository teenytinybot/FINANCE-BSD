'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Clock, AlertTriangle,
  CreditCard, Wallet, ShoppingBag, FileText,
  BarChart3, Bell, Download,
  Zap, Shield, TrendingUp, GitMerge, Users,
  ChevronRight,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const V   = '#6366F1'
const VD  = '#4338CA'
const VL  = '#EEF2FF'
const N   = '#0D1B3E'
const VLL = '#F5F3FF'

// ── Orbital card data ─────────────────────────────────────────────────────────
const innerOrbit = [
  { name: 'Invoices',     category: 'Finance',      color: '#6366F1', icon: '📊' },
  { name: 'WhatsApp',     category: 'Messaging',     color: '#25D366', icon: '💬' },
  { name: 'Payments',     category: 'Banking',       color: '#3B82F6', icon: '💳' },
  { name: 'Shopify',      category: 'E-commerce',    color: '#96BF48', icon: '🛍️' },
  { name: 'Reconcile',    category: 'Automation',    color: '#0EA5E9', icon: '🔄' },
  { name: 'AR Aging',     category: 'Analytics',     color: '#F59E0B', icon: '📈' },
]

const outerOrbit = [
  { name: 'Razorpay',     category: 'Payments',      color: '#3395FF', icon: '💰' },
  { name: 'Email',        category: 'Communication', color: '#EA4335', icon: '📧' },
  { name: 'Ledger',       category: 'Accounting',    color: '#7C3AED', icon: '📦' },
  { name: 'GST',          category: 'Compliance',    color: '#DC2626', icon: '📋' },
  { name: 'Alerts',       category: 'Notifications', color: '#FB923C', icon: '🔔' },
  { name: 'SMS',          category: 'Messaging',     color: '#EC4899', icon: '📱' },
  { name: 'Automation',   category: 'AI',            color: '#10B981', icon: '🤖' },
  { name: 'TDS',          category: 'Compliance',    color: '#64748B', icon: '🗂️' },
]

// ── Page sections data ────────────────────────────────────────────────────────
const brandLogos = [
  'Mamaearth', 'Meesho', 'Lenskart', 'NykaaFashion', 'Blinkit',
  'GlobalBees', 'The Good Glamm', 'Purplle', 'Delhivery', 'Vedix',
  'Wow Momo', 'Zoko', 'ShopEasy', 'Acme Corp',
]

const steps = [
  { n: '01', title: 'Brand Onboarding',   icon: <Users size={16} />,      desc: 'Brand signs up and selects a payment model. Finance configures credit cycle, GST, legal name, and bank details.' },
  { n: '02', title: 'Usage Tracking',     icon: <BarChart3 size={16} />,  desc: 'Platform usage tracked in real-time — WhatsApp, email, SMS, voice, AI — metered continuously per brand.' },
  { n: '03', title: 'Invoice Generation', icon: <FileText size={16} />,   desc: "Invoice auto-generated at cycle end and dispatched to the brand's email. Downloadable immediately from the dashboard." },
  { n: '04', title: 'Payment & UTR',      icon: <CreditCard size={16} />, desc: 'Brand pays via preferred method and submits UTR on the dashboard. Extension requests can be raised with a reason.' },
  { n: '05', title: 'Reconciliation',     icon: <GitMerge size={16} />,   desc: 'Finance uploads bank statement, auto-matches by reference, manually links gaps. TDS uploaded quarterly, receipts issued.' },
  { n: '06', title: 'Account Status',     icon: <Bell size={16} />,       desc: 'Account stays active within the credit cycle. Overdue accounts get automated reminders before suspension triggers.' },
]

const paymentModels = [
  {
    icon: <Wallet size={20} />,
    model: 'Prepaid',
    tag: 'Wallet-based',
    color: V,
    description: 'Load wallet credits in advance. Usage deducted in real-time. Auto-pause at zero — no surprise suspensions.',
    highlights: ['Wallet balance on dashboard', 'Auto-pause at zero balance', 'Instant recharge, any method', 'Receipts downloadable anytime'],
  },
  {
    icon: <Clock size={20} />,
    model: 'Postpaid',
    tag: 'Invoice-based',
    color: '#0EA5E9',
    description: 'Use now, pay later. Invoiced at end of billing cycle within the credit window configured by finance.',
    highlights: ['Invoice at cycle end', 'Finance-configured credit cycle', 'Extension requestable with reason', 'Grace period before suspension'],
  },
  {
    icon: <ShoppingBag size={20} />,
    model: 'Shopify',
    tag: 'App billing',
    color: '#10B981',
    description: "Billed through Shopify's native billing. Charges appear on your Shopify invoice — zero manual action needed.",
    highlights: ['Billed via Shopify API', 'On your Shopify invoice', 'No manual payment needed', 'Managed via Shopify admin'],
  },
]

const features = [
  { icon: <Zap size={16} />,        title: 'Real-time Usage Tracking',  desc: 'Every message, call, and AI interaction metered the moment it happens — no manual counting.' },
  { icon: <Shield size={16} />,     title: 'Role-based Access',         desc: 'Finance team sees all brands. Brand POCs see only their own invoices and payment history.' },
  { icon: <GitMerge size={16} />,   title: 'Bank Reconciliation',       desc: 'Upload bank statements, auto-match by reference, spot and resolve gaps in one view.' },
  { icon: <Bell size={16} />,       title: 'Smart Notifications',       desc: 'Automated reminders, extension workflows, suspension alerts, and daily finance reports.' },
  { icon: <TrendingUp size={16} />, title: 'AR Aging Reports',          desc: '5-bucket aging analysis — current, 1–30, 31–60, 61–90, 90+ days — filterable by brand.' },
  { icon: <Download size={16} />,   title: 'Ledger & PDF Export',       desc: 'Download full payment ledgers, individual invoices, or filtered aging reports as CSV or PDF.' },
]

const policies = [
  { icon: <AlertTriangle size={14} />, title: 'Suspension Policy',      color: '#F59E0B', bg: '#FFFBEB', body: 'Accounts overdue beyond the agreed credit cycle receive automated reminders. Suspension triggers only after the grace period — services resume immediately on payment.' },
  { icon: <Clock size={14} />,         title: 'Payment Date Extension', color: V,         bg: VL,        body: 'Brands can request a due-date extension from the dashboard with a written reason. Finance team is notified instantly and can approve or reject with a note.' },
  { icon: <Download size={14} />,      title: 'TDS & Compliance',       color: '#10B981', bg: '#F0FDF4', body: 'Quarterly TDS certificates must be uploaded via the dashboard. All compliance documents stored securely and accessible to the finance team anytime.' },
]

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useFadeIn()
  return (
    <div ref={ref} className={className} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
    }}>
      {children}
    </div>
  )
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function Pill({ children, color = V }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 100,
      background: color + '18', color, border: `1px solid ${color}30`,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}

function ArrowBtn({ href, children, variant = 'dark' }: { href: string; children: React.ReactNode; variant?: 'dark' | 'outline' | 'violet' | 'accent' }) {
  const [hov, setHov] = useState(false)
  const styles: Record<string, React.CSSProperties> = {
    dark:    { background: '#fff',                    color: '#0D1B3E', border: 'none' },
    outline: { background: 'rgba(255,255,255,0.08)',  color: '#fff',    border: '1px solid rgba(255,255,255,0.18)' },
    violet:  { background: V,                         color: '#fff',    border: 'none' },
    accent:  { background: V,                         color: '#fff',    border: 'none', padding: '14px 36px', fontSize: 16, borderRadius: 100 },
  }
  return (
    <Link href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '11px 24px', borderRadius: 12,
        fontWeight: 600, fontSize: 14, textDecoration: 'none',
        transition: 'all 0.22s ease',
        boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.25)' : 'none',
        transform: hov ? 'translateY(-1px)' : 'none',
        ...styles[variant],
      }}
    >
      {children}
      <ArrowRight size={14} style={{ transform: hov ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.22s ease' }} />
    </Link>
  )
}

// ── Orbital card ──────────────────────────────────────────────────────────────
function OrbCard({ card }: { card: { name: string; category: string; color: string; icon: string } }) {
  return (
    <div style={{
      background: 'rgba(20, 22, 40, 0.85)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 14,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 118,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      userSelect: 'none',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: card.color + '22',
        border: `1px solid ${card.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {card.icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F0F0F5', lineHeight: 1.2 }}>{card.name}</p>
        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.32)', marginTop: 2, letterSpacing: '0.02em' }}>{card.category}</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 64) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const innerPeriod = 24  // seconds for one full inner orbit
  const outerPeriod = 42  // seconds for one full outer orbit

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#111', fontFamily: 'Geist, DM Sans, system-ui, sans-serif' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        transition: 'all 0.3s ease',
        background:     scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)'            : 'none',
        borderBottom:   scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
        boxShadow:      scrolled ? '0 1px 20px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: scrolled ? N : 'rgba(255,255,255,0.15)', border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>B</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: scrolled ? N : '#fff', transition: 'color 0.3s' }}>
              bite<strong>speed</strong>
              <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 400, color: scrolled ? '#9CA3AF' : 'rgba(255,255,255,0.4)' }}>Finance</span>
            </span>
          </div>

          <nav style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'How it works',   href: '#how-it-works' },
              { label: 'Payment models', href: '#payment-models' },
              { label: 'Features',       href: '#features' },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                color: scrolled ? '#6B7280' : 'rgba(255,255,255,0.58)',
                transition: 'color 0.2s',
              }}>
                {label}
              </a>
            ))}
          </nav>

          <ArrowBtn href="/login" variant={scrolled ? 'violet' : 'outline'}>Sign in</ArrowBtn>
        </div>
      </header>

      {/* ── Hero: wrrk.ai-style orbital ─────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#0A0C18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>

        {/* CSS keyframe animations */}
        <style>{`
          @keyframes orbitCW {
            from { transform: rotate(0deg) translateX(270px); }
            to   { transform: rotate(360deg) translateX(270px); }
          }
          @keyframes counterCW {
            from { transform: translateY(-50%) rotate(0deg); }
            to   { transform: translateY(-50%) rotate(-360deg); }
          }
          @keyframes orbitCCW {
            from { transform: rotate(0deg) translateX(430px); }
            to   { transform: rotate(-360deg) translateX(430px); }
          }
          @keyframes counterCCW {
            from { transform: translateY(-50%) rotate(0deg); }
            to   { transform: translateY(-50%) rotate(360deg); }
          }
          @keyframes heroFadeIn {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Subtle radial glow behind center text */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          pointerEvents: 'none',
        }} />

        {/* ── Inner orbit (CW, 6 cards) ── */}
        {innerOrbit.map((card, i) => {
          const delay = -((innerPeriod / innerOrbit.length) * i)
          return (
            <div key={`in-${i}`} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 0, height: 0,
              animation: `orbitCW ${innerPeriod}s linear infinite`,
              animationDelay: `${delay}s`,
            }}>
              <div style={{
                position: 'absolute',
                animation: `counterCW ${innerPeriod}s linear infinite`,
                animationDelay: `${delay}s`,
              }}>
                <OrbCard card={card} />
              </div>
            </div>
          )
        })}

        {/* ── Outer orbit (CCW, 8 cards) ── */}
        {outerOrbit.map((card, i) => {
          const delay = -((outerPeriod / outerOrbit.length) * i)
          return (
            <div key={`out-${i}`} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 0, height: 0,
              animation: `orbitCCW ${outerPeriod}s linear infinite`,
              animationDelay: `${delay}s`,
            }}>
              <div style={{
                position: 'absolute',
                animation: `counterCCW ${outerPeriod}s linear infinite`,
                animationDelay: `${delay}s`,
              }}>
                <OrbCard card={card} />
              </div>
            </div>
          )
        })}

        {/* ── Center text ── */}
        <div style={{
          position: 'relative', zIndex: 10,
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          animation: 'heroFadeIn 0.8s ease 0.2s both',
        }}>
          {/* Brand logo mark */}
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(99,102,241,0.18)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#A5B4FC' }}>B</span>
          </div>

          {/* Main headline */}
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(3.2rem, 7vw, 6.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1,
            color: '#fff',
          }}>
            bite<span style={{
              background: 'linear-gradient(135deg, #A5B4FC 0%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>speed</span>
          </h1>

          {/* Tagline */}
          <p style={{
            margin: '20px 0 0',
            fontSize: 'clamp(1rem, 2vw, 1.3rem)',
            color: 'rgba(255,255,255,0.48)',
            fontWeight: 400,
            letterSpacing: '0.01em',
            maxWidth: 400,
            lineHeight: 1.5,
          }}>
            It all starts with the conversation.
          </p>

          {/* CTA */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 40px',
              borderRadius: 100,
              background: V,
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              transition: 'all 0.22s ease',
              boxShadow: `0 8px 32px ${V}55`,
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = VD
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = `0 12px 40px ${V}70`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = V
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = `0 8px 32px ${V}55`
              }}
            >
              ✦ Open Dashboard →
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {['Finance team', 'Brand POCs', 'Internal only'].map(label => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ color: '#4ade80', fontSize: 10 }}>✓</span> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.2)',
        }}>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
        </div>
      </section>

      {/* ── Brand logos ticker ──────────────────────────────────────────── */}
      <section style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0', padding: '18px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          {[0, 1].map(pass => (
            <div key={pass} style={{
              display: 'flex', alignItems: 'center', gap: '2.5rem', flexShrink: 0,
              animation: 'marquee 26s linear infinite', paddingRight: '2.5rem',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#D1D5DB', whiteSpace: 'nowrap' }}>
                Brands on BitSpeed
              </span>
              {brandLogos.map(b => (
                <span key={b} style={{ fontSize: 13, fontWeight: 600, color: '#B0B8C8', whiteSpace: 'nowrap' }}>{b}</span>
              ))}
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* ── Pain points ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EF4444', marginBottom: 12 }}>The old way</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#111', marginBottom: 12 }}>
                Finance ops should not look like this.
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[
              { icon: '🗂️', text: 'Invoices scattered across emails' },
              { icon: '📊', text: 'Reconciliation done in spreadsheets' },
              { icon: '📞', text: 'Payment follow-ups via WhatsApp' },
              { icon: '⏰', text: 'Aging reports built manually every week' },
              { icon: '🚫', text: "No visibility on churn risk until it is too late" },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 12, fontSize: 14, color: '#374151' }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.4}>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: V }}>
                <ChevronRight size={18} />
                BitSpeed Finance replaces all of this — with one dashboard.
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '92px 0', background: '#FAFAFA', borderTop: '1px solid #F0F0F0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <FadeIn>
            <div style={{ marginBottom: 52 }}>
              <Pill>Step by step</Pill>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', marginTop: 16, marginBottom: 10 }}>How billing works — end to end</h2>
              <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480 }}>Every brand goes through this exact cycle, from onboarding to reconciliation.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {steps.map((step, i) => <FadeIn key={step.n} delay={i * 0.07}><StepCard step={step} /></FadeIn>)}
          </div>
        </div>
      </section>

      {/* ── Payment models ─────────────────────────────────────────────── */}
      <section id="payment-models" style={{ padding: '92px 0', background: VLL, borderTop: '1px solid #DDE3FF' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <FadeIn>
            <div style={{ marginBottom: 52 }}>
              <Pill>Payment models</Pill>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', marginTop: 16, marginBottom: 10 }}>Three ways brands pay</h2>
              <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480 }}>Each brand picks a model at onboarding. Finance configures the credit cycle accordingly.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {paymentModels.map((pm, i) => <FadeIn key={pm.model} delay={i * 0.09}><ModelCard pm={pm} /></FadeIn>)}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '92px 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <FadeIn>
            <div style={{ marginBottom: 52 }}>
              <Pill>Platform features</Pill>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', marginTop: 16, marginBottom: 10 }}>Everything finance needs. Nothing it does not.</h2>
              <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480 }}>Built specifically for the BitSpeed finance team — every feature earns its place.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {features.map((f, i) => <FadeIn key={f.title} delay={i * 0.07}><FeatureCard f={f} /></FadeIn>)}
          </div>
        </div>
      </section>

      {/* ── Policies ───────────────────────────────────────────────────── */}
      <section style={{ padding: '92px 0', background: '#FAFAFA', borderTop: '1px solid #F0F0F0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px' }}>
          <FadeIn>
            <div style={{ marginBottom: 52 }}>
              <Pill color="#374151">Policies</Pill>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em', marginTop: 16, marginBottom: 10 }}>The rules, clearly stated.</h2>
              <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480 }}>No ambiguity. Every brand and the finance team knows exactly what happens and when.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {policies.map((p, i) => <FadeIn key={p.title} delay={i * 0.09}><PolicyCard p={p} /></FadeIn>)}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${N} 0%, #1d2560 50%, ${VD} 100%)`,
        padding: '100px 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <FadeIn>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Pill color="#A5B4FC">Get started</Pill>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', margin: '20px 0 16px', lineHeight: 1.1 }}>
              Ready to manage finance<br />at speed?
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 400, margin: '0 auto 40px' }}>
              Log in to manage invoices, payments, reconciliation, AR aging, and brand accounts — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <ArrowBtn href="/login" variant="dark">Open Finance Dashboard</ArrowBtn>
              <ArrowBtn href="#how-it-works" variant="outline">Learn more</ArrowBtn>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ background: N }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>B</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
              bite<strong>speed</strong>
              <span style={{ marginLeft: 6, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>Finance</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/login" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Sign in</Link>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} BitSpeed · Internal use only</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StepCard({ step }: { step: typeof steps[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: '#fff', border: `1px solid ${hov ? '#C7D2FE' : '#EDEDED'}`,
      borderRadius: 16, padding: '26px 22px',
      transition: 'all 0.25s ease',
      transform: hov ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: hov ? '0 12px 36px rgba(99,102,241,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
      cursor: 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#E0E0E0', letterSpacing: '0.06em' }}>{step.n}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: hov ? V : VLL, color: hov ? '#fff' : V, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease' }}>
          {step.icon}
        </div>
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 8, letterSpacing: '-0.01em' }}>{step.title}</h3>
      <p style={{ fontSize: 12, lineHeight: 1.65, color: '#9CA3AF' }}>{step.desc}</p>
    </div>
  )
}

function ModelCard({ pm }: { pm: typeof paymentModels[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: '#fff', border: '1px solid #E0E7FF', borderRadius: 16, overflow: 'hidden',
      transition: 'all 0.25s ease',
      transform: hov ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: hov ? `0 16px 48px ${pm.color}22` : '0 2px 6px rgba(0,0,0,0.04)',
    }}>
      <div style={{ height: 3, background: pm.color }} />
      <div style={{ padding: '26px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: pm.color + '15', color: pm.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pm.icon}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{pm.model}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF' }}>{pm.tag}</p>
          </div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.65, color: '#6B7280', marginBottom: 20 }}>{pm.description}</p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0 }}>
          {pm.highlights.map(h => (
            <li key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, color: '#374151' }}>
              <CheckCircle2 size={12} style={{ color: pm.color, flexShrink: 0 }} />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FeatureCard({ f }: { f: typeof features[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: hov ? VLL : '#fff',
      border: `1px solid ${hov ? '#C7D2FE' : '#EDEDED'}`,
      borderRadius: 16, padding: '26px 22px',
      transition: 'all 0.25s ease', cursor: 'default',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: hov ? V : VLL, color: hov ? '#fff' : V, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s ease', marginBottom: 16 }}>
        {f.icon}
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</h3>
      <p style={{ fontSize: 12, lineHeight: 1.65, color: '#9CA3AF' }}>{f.desc}</p>
    </div>
  )
}

function PolicyCard({ p }: { p: typeof policies[0] }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDEDED', borderRadius: 16, padding: '26px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: p.bg, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.icon}
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{p.title}</h3>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.7, color: '#9CA3AF' }}>{p.body}</p>
    </div>
  )
}
