'use client'

import { useState, useMemo } from 'react'
import {
  type BrandPlan, type Invoice, type Payment,
  type InvoiceStatus, type PaymentMethod,
  formatINR, getBrandPlan
} from '@/lib/mock-data'
import {
  Search, Eye, ExternalLink, Wallet, Plus, AlertTriangle,
  IndianRupee, Clock, CheckCircle2, FileText, CreditCard,
  Download, Bell, CalendarClock, BookOpen, ArrowLeft,
  ShoppingBag, GitMerge, CircleCheck, CircleAlert, CircleMinus,
} from 'lucide-react'

type BrandTab = 'overview' | 'plan' | 'invoices' | 'payments' | 'reconciliation'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  credit_card:   'Credit Card',
  upi:           'UPI',
  cheque:        'Cheque',
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const map = { paid: { label: 'Paid', cls: 'badge-paid' }, pending: { label: 'Pending', cls: 'badge-pending' }, overdue: { label: 'Overdue', cls: 'badge-overdue' } }
  const { label, cls } = map[status]
  return <span className={`${cls} px-2.5 py-0.5 rounded-full text-xs font-medium`}>{label}</span>
}

// ── Brand Overview Panel ──────────────────────────────────────────────────────
function BrandOverviewPanel({ plan, brandInvoices, brandPayments }: { plan: BrandPlan; brandInvoices: Invoice[]; brandPayments: Payment[] }) {
  const received    = brandPayments.reduce((s, p) => s + p.amount, 0)
  const outstanding = brandInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0)
  const overdue     = brandInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const isSuspended = plan.accountStatus === 'suspended'
  const isAtRisk    = plan.accountStatus === 'at_risk'
  const isLowBal    = plan.model === 'prepaid' && plan.walletBalance < 5000

  return (
    <div className="space-y-4">
      {/* Account alerts */}
      {isSuspended && (
        <div className="px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: 'var(--red-bg)', border: '1px solid #FECACA' }}>
          <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--red)' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--red)' }}>Account Suspended — overdue payment not cleared</p>
        </div>
      )}
      {isAtRisk && !isSuspended && (
        <div className="px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: 'var(--amber-bg)', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--amber)' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--amber)' }}>Payment overdue — account at risk of suspension</p>
        </div>
      )}

      {/* Wallet (prepaid) */}
      {plan.model === 'prepaid' && (
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: `1px solid ${isLowBal ? '#FECACA' : 'var(--border)'}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet size={15} style={{ color: 'var(--muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Wallet Balance</span>
              {isLowBal && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #FECACA' }}>Low</span>}
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--violet)', color: '#fff' }}>
              <Plus size={12} /> Add Balance
            </button>
          </div>
          <p className="text-2xl font-bold" style={{ color: isLowBal ? 'var(--red)' : 'var(--text)' }}>{formatINR(plan.walletBalance)}</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Paid',  value: formatINR(received),    accent: '#16A34A', icon: <IndianRupee size={14} /> },
          { label: 'Outstanding', value: formatINR(outstanding), accent: '#D97706', icon: <Clock size={14} /> },
          { label: 'Overdue',     value: formatINR(overdue),     accent: '#DC2626', icon: <AlertTriangle size={14} /> },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{m.label}</p>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: m.accent + '18', color: m.accent }}>{m.icon}</div>
            </div>
            <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
          <FileText size={13} style={{ color: 'var(--muted)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Recent Invoices</span>
        </div>
        {brandInvoices.slice(-4).reverse().map(inv => (
          <div key={inv.id} className="px-4 py-3 flex items-center justify-between border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{inv.number}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Due {inv.dueDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={inv.status} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</span>
            </div>
          </div>
        ))}
        {brandInvoices.length === 0 && <p className="text-xs text-center py-6" style={{ color: 'var(--subtle)' }}>No invoices</p>}
      </div>
    </div>
  )
}

// ── Brand Plan Panel ──────────────────────────────────────────────────────────
function BrandPlanPanel({ plan }: { plan: BrandPlan }) {
  const modelIcon = { prepaid: <Wallet size={18} />, postpaid: <Clock size={18} />, shopify: <ShoppingBag size={18} /> }
  const modelLabel = { prepaid: 'Prepaid · Wallet-based', postpaid: 'Postpaid · Invoice-based', shopify: 'Shopify Billing' }
  const statusMeta = {
    active:    { label: 'Active',    color: 'var(--green)', bg: 'var(--green-bg)', border: '#BBF7D0' },
    at_risk:   { label: 'At Risk',   color: 'var(--amber)', bg: 'var(--amber-bg)', border: '#FDE68A' },
    suspended: { label: 'Suspended', color: 'var(--red)',   bg: 'var(--red-bg)',   border: '#FECACA' },
  }[plan.accountStatus]

  return (
    <div className="space-y-4">
      <div className="px-4 py-3 rounded-xl flex items-center gap-2" style={{ background: statusMeta.bg, border: `1px solid ${statusMeta.border}` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: statusMeta.color }} />
        <p className="text-sm font-semibold" style={{ color: statusMeta.color }}>Account {statusMeta.label}</p>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--navy)', color: '#fff' }}>{modelIcon[plan.model]}</div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{plan.model.charAt(0).toUpperCase() + plan.model.slice(1)}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{modelLabel[plan.model]}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { label: 'Billing Period', value: `${plan.billingStart} → ${plan.billingEnd}` },
            { label: 'Next Billing',   value: plan.nextBillingDate },
            plan.creditCycleDays ? { label: 'Credit Cycle', value: `${plan.creditCycleDays} days` } : null,
            plan.platformFee     ? { label: 'Platform Fee',  value: formatINR(plan.platformFee) }   : null,
          ].filter(Boolean).map((item: any) => (
            <div key={item.label} className="rounded-lg p-3" style={{ background: '#FAFAFA', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>{item.label}</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Active Features</p>
        <div className="flex flex-wrap gap-2">
          {plan.features.map(f => (
            <div key={f} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: '#F5F4F3', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={11} style={{ color: '#16A34A' }} />{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Brand Invoices Panel ──────────────────────────────────────────────────────
function BrandInvoicesPanel({ brandInvoices }: { brandInvoices: Invoice[] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
            {['Invoice #', 'Description', 'Issued', 'Due Date', 'Status', 'Amount', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {brandInvoices.length === 0 && (
            <tr><td colSpan={7} className="text-center py-10 text-xs" style={{ color: 'var(--subtle)' }}>No invoices found</td></tr>
          )}
          {brandInvoices.map(inv => (
            <tr key={inv.id} className="row-hover">
              <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: 'var(--text)' }}>{inv.number}</td>
              <td className="px-4 py-3 text-xs max-w-[160px] truncate" style={{ color: 'var(--muted)' }}>{inv.description}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.issuedDate}</td>
              <td className="px-4 py-3 text-xs" style={{ color: inv.status === 'overdue' ? 'var(--red)' : 'var(--muted)' }}>{inv.dueDate}</td>
              <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
              <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover:bg-zinc-100" style={{ color: 'var(--muted)' }}><Download size={12} /></button>
                  {inv.status !== 'paid' && <button className="p-1.5 rounded hover:bg-amber-50" style={{ color: 'var(--amber)' }}><Bell size={12} /></button>}
                  {inv.status === 'pending' && <button className="p-1.5 rounded hover:bg-blue-50" style={{ color: 'var(--blue)' }}><CalendarClock size={12} /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {brandInvoices.length > 0 && (
        <div className="px-4 py-3 border-t flex justify-between" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>{brandInvoices.length} invoices</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Total: {formatINR(brandInvoices.reduce((s, i) => s + i.amount, 0))}</span>
        </div>
      )}
    </div>
  )
}

// ── Brand Reconciliation Panel ────────────────────────────────────────────────
function BrandReconciliationPanel({ brandInvoices, brandPayments }: { brandInvoices: Invoice[]; brandPayments: Payment[] }) {
  const totalBilled   = brandInvoices.reduce((s, i) => s + i.amount, 0)
  const totalReceived = brandPayments.reduce((s, p) => s + p.amount, 0)
  const gap           = totalBilled - totalReceived

  // Match each invoice to a payment
  const rows = brandInvoices.map(inv => {
    const matched = brandPayments.find(p => p.invoiceNumber === inv.number)
    return { inv, matched }
  })

  const fullyMatched = rows.filter(r => !!r.matched).length
  const unmatched    = rows.filter(r => !r.matched && r.inv.status !== 'paid').length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Billed',   value: formatINR(totalBilled),   accent: '#2563EB', sub: `${brandInvoices.length} invoices` },
          { label: 'Total Received', value: formatINR(totalReceived), accent: '#16A34A', sub: `${brandPayments.length} payments` },
          { label: 'Gap',            value: formatINR(gap),           accent: gap > 0 ? '#DC2626' : '#16A34A', sub: gap > 0 ? 'Outstanding' : 'Fully reconciled' },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{m.label}</p>
            <p className="text-base font-bold" style={{ color: m.accent }}>{m.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Match status row */}
      <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs" style={{ background: '#FAFAFA', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5" style={{ color: '#16A34A' }}>
          <CircleCheck size={13} /> <span className="font-medium">{fullyMatched} matched</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: '#D97706' }}>
          <CircleAlert size={13} /> <span className="font-medium">{unmatched} unmatched</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--subtle)' }}>
          <CircleMinus size={13} /> <span className="font-medium">{brandInvoices.length - fullyMatched - unmatched} pending/other</span>
        </div>
      </div>

      {/* Invoice-payment match table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
              {['Invoice #', 'Description', 'Due Date', 'Invoice Amt', 'Payment Ref', 'Received', 'Gap', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {rows.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-xs" style={{ color: 'var(--subtle)' }}>No invoices found</td></tr>
            )}
            {rows.map(({ inv, matched }) => {
              const rowGap      = matched ? inv.amount - matched.amount : (inv.status !== 'paid' ? inv.amount : 0)
              const isReconciled = !!matched && rowGap === 0
              const isPartial    = !!matched && rowGap > 0
              const isOpen       = !matched && inv.status !== 'paid'

              const statusLabel = isReconciled ? 'Reconciled' : isPartial ? 'Partial' : isOpen ? 'Open' : inv.status === 'paid' ? 'Paid (no ref)' : 'Pending'
              const statusColor = isReconciled ? '#16A34A' : isPartial ? '#D97706' : isOpen ? '#DC2626' : 'var(--muted)'
              const statusBg    = isReconciled ? '#F0FDF4' : isPartial ? '#FFFBEB' : isOpen ? '#FEF2F2' : '#F5F4F3'

              return (
                <tr key={inv.id} className="row-hover">
                  <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: 'var(--text)' }}>{inv.number}</td>
                  <td className="px-4 py-3 text-xs max-w-[140px] truncate" style={{ color: 'var(--muted)' }}>{inv.description}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: inv.status === 'overdue' ? 'var(--red)' : 'var(--muted)' }}>{inv.dueDate}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>{matched ? matched.reference : '—'}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: matched ? '#16A34A' : 'var(--subtle)' }}>
                    {matched ? `+${formatINR(matched.amount)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold" style={{ color: rowGap > 0 ? 'var(--red)' : '#16A34A' }}>
                    {rowGap === 0 ? '✓ Nil' : formatINR(rowGap)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: statusBg, color: statusColor }}>
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length > 0 && (
          <div className="px-4 py-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>{rows.length} invoices</span>
            <span className="text-xs font-semibold" style={{ color: gap > 0 ? 'var(--red)' : '#16A34A' }}>
              {gap > 0 ? `Gap: ${formatINR(gap)}` : 'Fully reconciled'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Brand Payments Panel ──────────────────────────────────────────────────────
function BrandPaymentsPanel({ brandPayments }: { brandPayments: Payment[] }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
            {['Invoice', 'Method', 'Reference / UTR', 'Date', 'Amount', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {brandPayments.length === 0 && (
            <tr><td colSpan={6} className="text-center py-10 text-xs" style={{ color: 'var(--subtle)' }}>No payments recorded</td></tr>
          )}
          {brandPayments.map(p => (
            <tr key={p.id} className="row-hover">
              <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text)' }}>{p.invoiceNumber}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{METHOD_LABELS[p.method]}</td>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--muted)' }}>{p.reference}</td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{p.receivedDate}</td>
              <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#16A34A' }}>+{formatINR(p.amount)}</td>
              <td className="px-4 py-3">
                <button className="p-1.5 rounded hover:bg-zinc-100" style={{ color: 'var(--muted)' }}><Download size={12} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {brandPayments.length > 0 && (
        <div className="px-4 py-3 border-t flex justify-between" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>{brandPayments.length} payments</span>
          <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>Total: {formatINR(brandPayments.reduce((s, p) => s + p.amount, 0))}</span>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BrandViewClient({
  brandPlans, allInvoices, allPayments,
}: { brandPlans: BrandPlan[]; allInvoices: Invoice[]; allPayments: Payment[] }) {
  const [query,       setQuery]       = useState('')
  const [selectedBrand, setSelected] = useState<BrandPlan | null>(null)
  const [activeTab,   setActiveTab]   = useState<BrandTab>('overview')

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return brandPlans.filter(p =>
      p.shopifyUrl.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    )
  }, [query, brandPlans])

  function select(plan: BrandPlan) {
    setSelected(plan)
    setQuery('')
    setActiveTab('overview')
  }

  function clear() {
    setSelected(null)
    setQuery('')
  }

  const brandInvoices = selectedBrand ? allInvoices.filter(i => i.client === selectedBrand.brand) : []
  const brandPayments = selectedBrand ? allPayments.filter(p => p.client === selectedBrand.brand) : []

  const TABS: { id: BrandTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',        label: 'Overview',        icon: <Eye size={14} /> },
    { id: 'plan',            label: 'Plan Details',    icon: <BookOpen size={14} /> },
    { id: 'invoices',        label: 'Invoices',        icon: <FileText size={14} /> },
    { id: 'payments',        label: 'Payments',        icon: <CreditCard size={14} /> },
    { id: 'reconciliation',  label: 'Reconciliation',  icon: <GitMerge size={14} /> },
  ]

  return (
    <div className="p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Brand View</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Enter a Shopify URL or brand name to preview their dashboard
        </p>
      </div>

      {/* Search */}
      {!selectedBrand && (
        <div className="max-w-lg">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. mamaearth.myshopify.com or Mamaearth"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              {suggestions.map(p => (
                <button
                  key={p.brand}
                  onClick={() => select(p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F5F3FF] transition-colors border-b last:border-0 text-left"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.brand}</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--subtle)' }}>{p.shopifyUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#F5F4F3', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                      {p.model}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: p.accountStatus === 'active' ? 'var(--green-bg)' : p.accountStatus === 'at_risk' ? 'var(--amber-bg)' : 'var(--red-bg)',
                        color:      p.accountStatus === 'active' ? 'var(--green)'    : p.accountStatus === 'at_risk' ? 'var(--amber)'    : 'var(--red)',
                      }}>
                      {p.accountStatus}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && suggestions.length === 0 && (
            <p className="mt-3 text-sm" style={{ color: 'var(--subtle)' }}>No brand matched. Try another URL or name.</p>
          )}

          {/* All brands list */}
          {!query && (
            <div className="mt-6">
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>All brands</p>
              <div className="space-y-2">
                {brandPlans.map(p => (
                  <button
                    key={p.brand}
                    onClick={() => select(p)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.brand}</p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--subtle)' }}>{p.shopifyUrl}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: '#F5F4F3', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        {p.model}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: p.accountStatus === 'active' ? 'var(--green-bg)' : p.accountStatus === 'at_risk' ? 'var(--amber-bg)' : 'var(--red-bg)',
                          color:      p.accountStatus === 'active' ? 'var(--green)'    : p.accountStatus === 'at_risk' ? 'var(--amber)'    : 'var(--red)',
                        }}>
                        {p.accountStatus}
                      </span>
                      <ExternalLink size={13} style={{ color: 'var(--subtle)' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand dashboard view */}
      {selectedBrand && (
        <div>
          {/* Brand header bar */}
          <div className="flex items-center justify-between mb-5 p-4 rounded-xl" style={{ background: 'var(--navy)' }}>
            <div className="flex items-center gap-3">
              <button onClick={clear} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#9CA3AF' }}>
                <ArrowLeft size={16} />
              </button>
              <div>
                <p className="text-white font-semibold text-sm">{selectedBrand.brand}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: '#6B7280' }}>{selectedBrand.shopifyUrl}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#D6D3D1' }}>
                {selectedBrand.model}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: selectedBrand.accountStatus === 'active' ? 'var(--green-bg)' : selectedBrand.accountStatus === 'at_risk' ? 'var(--amber-bg)' : 'var(--red-bg)',
                  color:      selectedBrand.accountStatus === 'active' ? 'var(--green)'    : selectedBrand.accountStatus === 'at_risk' ? 'var(--amber)'    : 'var(--red)',
                }}>
                {selectedBrand.accountStatus}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 border-b" style={{ borderColor: 'var(--border)' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px"
                style={{ borderColor: activeTab === t.id ? 'var(--violet)' : 'transparent', color: activeTab === t.id ? 'var(--violet)' : 'var(--muted)' }}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview'       && <BrandOverviewPanel       plan={selectedBrand} brandInvoices={brandInvoices} brandPayments={brandPayments} />}
          {activeTab === 'plan'           && <BrandPlanPanel           plan={selectedBrand} />}
          {activeTab === 'invoices'       && <BrandInvoicesPanel       brandInvoices={brandInvoices} />}
          {activeTab === 'payments'       && <BrandPaymentsPanel       brandPayments={brandPayments} />}
          {activeTab === 'reconciliation' && <BrandReconciliationPanel brandInvoices={brandInvoices} brandPayments={brandPayments} />}
        </div>
      )}
    </div>
  )
}
