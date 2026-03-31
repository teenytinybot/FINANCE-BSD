'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatINR } from '@/lib/mock-data'
import {
  ClipboardList, X, Phone, Mail, Copy, CheckCheck,
  AlertTriangle, TrendingDown, Clock, Wallet,
  ExternalLink, ArrowRight, ShieldAlert, BadgeAlert,
  UserX, CheckCircle2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SuspendedItem {
  brand:           string
  shopifyUrl:      string
  pocName:         string
  pocEmail:        string
  totalOverdue:    number
  hasExtension:    boolean
  lastPaymentDate: string | null
}
export interface ChurnRiskItem {
  brand:                string
  shopifyUrl:           string
  pocName:              string
  pocEmail:             string
  totalOverdue:         number
  daysSinceLastPayment: number
  overdueInvoiceCount:  number
}
export interface PendingExtItem {
  id:              string
  brand:           string
  shopifyUrl:      string
  invoiceNumber:   string
  invoiceAmount:   number
  originalDueDate: string
  requestedDate:   string
  daysWaiting:     number
}
export interface CallListItem {
  brand:     string
  shopifyUrl: string
  pocName:   string
  pocEmail:  string
  amount:    number
  reason:    string
  priority:  'critical' | 'high'
}
export interface AtRiskItem {
  brand:        string
  shopifyUrl:   string
  pocName:      string
  pocEmail:     string
  totalOverdue: number
}
export interface LowWalletItem {
  brand:         string
  shopifyUrl:    string
  walletBalance: number
}

export interface ReportData {
  date:               string
  suspended:          SuspendedItem[]
  churnRisk:          ChurnRiskItem[]
  pendingExtensions:  PendingExtItem[]
  callList:           CallListItem[]
  atRisk:             AtRiskItem[]
  lowWallet:          LowWalletItem[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function PriorityBadge({ level }: { level: 'critical' | 'high' | 'medium' | 'low' }) {
  const map = {
    critical: { label: '🚨 Critical', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    high:     { label: '⚠️ High',     bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    medium:   { label: '📋 Medium',   bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    low:      { label: '💡 Low',      bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  }
  const m = map[level]
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      {m.label}
    </span>
  )
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1 text-xs transition-colors"
      style={{ color: copied ? '#16A34A' : '#6B7280' }}>
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {email}
    </button>
  )
}

function SectionHeader({
  icon, title, count, priority, desc,
}: { icon: React.ReactNode; title: string; count: number; priority: 'critical' | 'high' | 'medium' | 'low'; desc?: string }) {
  const colors = {
    critical: '#DC2626', high: '#D97706', medium: '#2563EB', low: '#16A34A'
  }
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: colors[priority] + '18', color: colors[priority] }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</p>
          {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</p>}
        </div>
      </div>
      <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
        style={{ background: colors[priority] + '18', color: colors[priority] }}>
        {count}
      </span>
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function DailyReportDrawer({ data }: { data: ReportData }) {
  const [open, setOpen] = useState(false)

  const totalCritical = data.suspended.length
  const totalHigh     = data.churnRisk.length + data.pendingExtensions.length
  const totalMedium   = data.atRisk.length
  const totalItems    = totalCritical + totalHigh + totalMedium + data.lowWallet.length

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        style={{ background: '#0D1B3E', color: '#fff' }}
      >
        <ClipboardList size={15} />
        Today's Report
        {totalCritical > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: '#DC2626', color: '#fff' }}>
            {totalCritical}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-screen z-50 flex flex-col overflow-hidden transition-all duration-300"
        style={{
          width:      480,
          transform:  open ? 'translateX(0)' : 'translateX(100%)',
          background: '#fff',
          borderLeft: '1px solid var(--border)',
          boxShadow:  '-8px 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: 'var(--border)', background: '#0D1B3E' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-bold text-base">Daily Agenda</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{data.date} · {totalItems} action items</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <X size={18} />
            </button>
          </div>
          {/* Summary pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {totalCritical > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(220,38,38,0.25)', color: '#FCA5A5' }}>
                🚨 {totalCritical} Critical
              </span>
            )}
            {totalHigh > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(217,119,6,0.25)', color: '#FCD34D' }}>
                ⚠️ {totalHigh} High
              </span>
            )}
            {totalMedium > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(37,99,235,0.25)', color: '#93C5FD' }}>
                📋 {totalMedium} Medium
              </span>
            )}
            {totalItems === 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(22,163,74,0.25)', color: '#86EFAC' }}>
                ✅ All clear today
              </span>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {totalItems === 0 && (
            <div className="text-center py-16">
              <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: '#16A34A' }} />
              <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>Nothing critical today</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All accounts are in good standing.</p>
            </div>
          )}

          {/* ── 1. Suspended accounts ── */}
          {data.suspended.length > 0 && (
            <section>
              <SectionHeader
                icon={<UserX size={14} />}
                title="Suspended Accounts"
                count={data.suspended.length}
                priority="critical"
                desc="Immediate action — call POC, clear outstanding balance"
              />
              <div className="space-y-3">
                {data.suspended.map(item => (
                  <div key={item.brand} className="rounded-xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{item.brand}</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#9CA3AF' }}>{item.shopifyUrl}</p>
                      </div>
                      <PriorityBadge level="critical" />
                    </div>
                    <div className="flex gap-4 text-xs mb-3">
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Overdue</p>
                        <p className="font-bold mt-0.5" style={{ color: '#DC2626' }}>{formatINR(item.totalOverdue)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Last Payment</p>
                        <p className="font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{item.lastPaymentDate ?? 'Never'}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Extension</p>
                        <p className="font-semibold mt-0.5" style={{ color: item.hasExtension ? '#D97706' : '#DC2626' }}>
                          {item.hasExtension ? 'Pending review' : 'Not requested'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#FECACA' }}>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.pocName}</p>
                        <CopyEmail email={item.pocEmail} />
                      </div>
                      <div className="flex gap-2">
                        <a href={`mailto:${item.pocEmail}?subject=Urgent: Account Suspended - ${item.brand}&body=Dear ${item.pocName},%0D%0A%0D%0AYour BitSpeed account has been suspended due to an overdue payment of ${formatINR(item.totalOverdue)}. Please clear the outstanding balance immediately to restore access.%0D%0A%0D%0ARegards,%0D%0ABitSpeed Finance Team`}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: '#DC2626', color: '#fff' }}>
                          <Mail size={11} /> Email Now
                        </a>
                        <Link href="/dashboard/notifications"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: '#fff', color: '#DC2626', border: '1px solid #FECACA' }}
                          onClick={() => setOpen(false)}>
                          View <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 2. Churn Risk ── */}
          {data.churnRisk.length > 0 && (
            <section>
              <SectionHeader
                icon={<TrendingDown size={14} />}
                title="Potential Churn Risk"
                count={data.churnRisk.length}
                priority="high"
                desc="No payment in 90+ days — high probability of churning"
              />
              <div className="space-y-3">
                {data.churnRisk.map(item => (
                  <div key={item.brand} className="rounded-xl p-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{item.brand}</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#9CA3AF' }}>{item.shopifyUrl}</p>
                      </div>
                      <PriorityBadge level="high" />
                    </div>
                    <div className="flex gap-4 text-xs mb-3">
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Outstanding</p>
                        <p className="font-bold mt-0.5" style={{ color: '#D97706' }}>{formatINR(item.totalOverdue)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Last paid</p>
                        <p className="font-bold mt-0.5" style={{ color: '#D97706' }}>{item.daysSinceLastPayment} days ago</p>
                      </div>
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Invoices</p>
                        <p className="font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{item.overdueInvoiceCount} overdue</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#FDE68A' }}>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.pocName}</p>
                        <CopyEmail email={item.pocEmail} />
                      </div>
                      <a href={`mailto:${item.pocEmail}?subject=Payment Follow-up — ${item.brand}`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: '#D97706', color: '#fff' }}>
                        <Mail size={11} /> Follow Up
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 3. Pending extension decisions ── */}
          {data.pendingExtensions.length > 0 && (
            <section>
              <SectionHeader
                icon={<Clock size={14} />}
                title="Pending Extension Decisions"
                count={data.pendingExtensions.length}
                priority="high"
                desc="Brands waiting on your approve/reject — respond today"
              />
              <div className="space-y-3">
                {data.pendingExtensions.map(item => (
                  <div key={item.id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid #FDE68A' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{item.brand}</p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#9CA3AF' }}>{item.shopifyUrl}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
                        {item.daysWaiting}d waiting
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs mb-3">
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Invoice</p>
                        <p className="font-mono font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{item.invoiceNumber}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Amount</p>
                        <p className="font-bold mt-0.5" style={{ color: 'var(--text)' }}>{formatINR(item.invoiceAmount)}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9CA3AF' }}>Requested → New date</p>
                        <p className="font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{item.originalDueDate} → {item.requestedDate}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'var(--violet)', color: '#fff' }}
                    >
                      Review Request <ArrowRight size={11} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 4. POC Call List ── */}
          {data.callList.length > 0 && (
            <section>
              <SectionHeader
                icon={<Phone size={14} />}
                title="POC Call / Email List"
                count={data.callList.length}
                priority="high"
                desc="Brands to contact today — missed payments, no extension filed"
              />
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {data.callList.map((item, i) => (
                  <div key={item.brand}
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: i < data.callList.length - 1 ? '1px solid var(--border)' : 'none', background: '#fff' }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{item.brand}</p>
                        <PriorityBadge level={item.priority} />
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.pocName}</p>
                      <CopyEmail email={item.pocEmail} />
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-xs font-bold" style={{ color: item.priority === 'critical' ? '#DC2626' : '#D97706' }}>{formatINR(item.amount)}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 5. At-risk accounts ── */}
          {data.atRisk.length > 0 && (
            <section>
              <SectionHeader
                icon={<BadgeAlert size={14} />}
                title="At-Risk Accounts"
                count={data.atRisk.length}
                priority="medium"
                desc="Overdue payments — act before they become suspended"
              />
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #BFDBFE' }}>
                {data.atRisk.map((item, i) => (
                  <div key={item.brand}
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: i < data.atRisk.length - 1 ? '1px solid #BFDBFE' : 'none', background: '#EFF6FF' }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.brand}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CopyEmail email={item.pocEmail} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: '#2563EB' }}>{formatINR(item.totalOverdue)}</p>
                      <a href={`mailto:${item.pocEmail}`}
                        className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#2563EB' }}>
                        <Mail size={10} /> Send reminder
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 6. Low wallet ── */}
          {data.lowWallet.length > 0 && (
            <section>
              <SectionHeader
                icon={<Wallet size={14} />}
                title="Low Wallet Balance"
                count={data.lowWallet.length}
                priority="low"
                desc="Prepaid brands — may face service interruption soon"
              />
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #BBF7D0' }}>
                {data.lowWallet.map((item, i) => (
                  <div key={item.brand}
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: i < data.lowWallet.length - 1 ? '1px solid #BBF7D0' : 'none', background: '#F0FDF4' }}
                  >
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.brand}</p>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: '#16A34A' }}>{formatINR(item.walletBalance)} left</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Send top-up reminder</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="pt-2 pb-4 text-center">
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>Generated for {data.date} · BitSpeed Finance</p>
          </div>
        </div>
      </div>
    </>
  )
}
