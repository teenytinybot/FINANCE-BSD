import { getMetrics, invoices, payments, formatINR, getBrandPlan, brandPlans, brandUsers, extensionRequests } from '@/lib/mock-data'
import { getSession } from '@/lib/session'
import { getSubmissions, getResolution } from '@/lib/extension-store'
import { TrendingUp, Clock, AlertTriangle, IndianRupee, FileText, CreditCard, Wallet, Plus, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import DailyReportDrawer, { type ReportData } from '@/components/dashboard/DailyReportDrawer'

const TODAY     = new Date('2026-03-30')
const TODAY_STR = '2026-03-30'

function daysBetween(dateStr: string): number {
  return Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86400000)
}

function StatusBadge({ status }: { status: 'paid' | 'pending' | 'overdue' }) {
  const map = { paid: { label: 'Paid', cls: 'badge-paid' }, pending: { label: 'Pending', cls: 'badge-pending' }, overdue: { label: 'Overdue', cls: 'badge-overdue' } }
  const { label, cls } = map[status]
  return <span className={`${cls} px-2 py-0.5 rounded-full text-xs font-medium`}>{label}</span>
}

// ── Compute daily report data ─────────────────────────────────────────────────
function buildReportData(): ReportData {
  // Merge extension requests: store + static (with resolutions applied)
  const storeReqs  = getSubmissions()
  const staticReqs = extensionRequests.map(r => {
    const res = getResolution(r.id)
    return res ? { ...r, ...res } : r
  })
  const allExtReqs = [...storeReqs, ...staticReqs]

  const pendingExts = allExtReqs.filter(r => r.status === 'pending')

  // Helper: last payment date for a brand
  function lastPaymentDate(brand: string): string | null {
    const sorted = payments
      .filter(p => p.client === brand)
      .sort((a, b) => b.receivedDate.localeCompare(a.receivedDate))
    return sorted[0]?.receivedDate ?? null
  }

  // ── Suspended accounts ──
  const suspended = brandPlans
    .filter(p => p.accountStatus === 'suspended')
    .map(p => {
      const poc          = brandUsers.find(u => u.brand === p.brand)
      const overdueInvs  = invoices.filter(i => i.client === p.brand && i.status === 'overdue')
      const totalOverdue = overdueInvs.reduce((s, i) => s + i.amount, 0)
      const hasExtension = pendingExts.some(r => r.brand === p.brand)
      return {
        brand:           p.brand,
        shopifyUrl:      p.shopifyUrl,
        pocName:         poc?.name  ?? 'Unknown',
        pocEmail:        poc?.email ?? '',
        totalOverdue,
        hasExtension,
        lastPaymentDate: lastPaymentDate(p.brand),
      }
    })

  // ── Churn risk: 90+ days since last payment AND has unpaid invoices ──
  const churnRisk = brandPlans
    .filter(p => p.accountStatus !== 'suspended') // suspended handled separately
    .flatMap(p => {
      const last    = lastPaymentDate(p.brand)
      const daysSince = last ? daysBetween(last) : 9999
      if (daysSince < 90) return []
      const overdueInvs = invoices.filter(i => i.client === p.brand && i.status !== 'paid')
      if (overdueInvs.length === 0) return []
      const poc = brandUsers.find(u => u.brand === p.brand)
      return [{
        brand:                p.brand,
        shopifyUrl:           p.shopifyUrl,
        pocName:              poc?.name  ?? 'Unknown',
        pocEmail:             poc?.email ?? '',
        totalOverdue:         overdueInvs.reduce((s, i) => s + i.amount, 0),
        daysSinceLastPayment: daysSince === 9999 ? 365 : daysSince,
        overdueInvoiceCount:  overdueInvs.filter(i => i.status === 'overdue').length,
      }]
    })
    .sort((a, b) => b.daysSinceLastPayment - a.daysSinceLastPayment)

  // ── Pending extension decisions ──
  const pendingExtensions = pendingExts.map(r => ({
    id:              r.id,
    brand:           r.brand,
    shopifyUrl:      r.shopifyUrl,
    invoiceNumber:   r.invoiceNumber,
    invoiceAmount:   r.invoiceAmount,
    originalDueDate: r.originalDueDate,
    requestedDate:   r.requestedDate,
    daysWaiting:     daysBetween(r.requestedAt),
  }))

  // ── At-risk accounts (overdue but not suspended) ──
  const atRisk = brandPlans
    .filter(p => p.accountStatus === 'at_risk')
    .map(p => {
      const poc         = brandUsers.find(u => u.brand === p.brand)
      const unpaid      = invoices.filter(i => i.client === p.brand && i.status !== 'paid')
      return {
        brand:        p.brand,
        shopifyUrl:   p.shopifyUrl,
        pocName:      poc?.name  ?? 'Unknown',
        pocEmail:     poc?.email ?? '',
        totalOverdue: unpaid.reduce((s, i) => s + i.amount, 0),
      }
    })

  // ── POC call list: suspended (no extension) + brands overdue >60d with no extension ──
  const callList = [
    ...suspended
      .filter(s => !s.hasExtension)
      .map(s => ({ brand: s.brand, shopifyUrl: s.shopifyUrl, pocName: s.pocName, pocEmail: s.pocEmail, amount: s.totalOverdue, reason: 'Suspended · no extension filed', priority: 'critical' as const })),
    ...churnRisk
      .filter(c => !pendingExts.some(r => r.brand === c.brand))
      .map(c => ({ brand: c.brand, shopifyUrl: c.shopifyUrl, pocName: c.pocName, pocEmail: c.pocEmail, amount: c.totalOverdue, reason: `${c.daysSinceLastPayment}d no payment`, priority: 'high' as const })),
  ]

  // ── Low wallet: prepaid brands with < ₹5000 ──
  const lowWallet = brandPlans
    .filter(p => p.model === 'prepaid' && p.walletBalance < 5000)
    .map(p => ({ brand: p.brand, shopifyUrl: p.shopifyUrl, walletBalance: p.walletBalance }))

  return {
    date: new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(TODAY),
    suspended,
    churnRisk,
    pendingExtensions,
    callList,
    atRisk,
    lowWallet,
  }
}

// ── Finance team overview ─────────────────────────────────────────────────────
function FinanceOverview({ received, outstanding, overdue, pending, recentInvoices, recentPayments, reportData }: any) {
  const metrics = [
    { label: 'Total Received',  value: formatINR(received),    sub: `Across ${recentPayments.length} payments`,              icon: <IndianRupee size={16} />, accent: '#16A34A' },
    { label: 'Outstanding',     value: formatINR(outstanding), sub: 'Across all unpaid invoices',                             icon: <Clock size={16} />,       accent: '#D97706' },
    { label: 'Overdue',         value: formatINR(overdue),     sub: 'Past due date, action needed',                          icon: <AlertTriangle size={16} />,accent: '#DC2626' },
    { label: 'Pending',         value: formatINR(pending),     sub: 'Awaiting payment within cycle',                         icon: <TrendingUp size={16} />,  accent: '#2563EB' },
  ]
  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Finance summary across all brands · Q1 2025</p>
        </div>
        <DailyReportDrawer data={reportData} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{m.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: m.accent + '18', color: m.accent }}>{m.icon}</div>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>{m.value}</p>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>{m.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2"><FileText size={15} style={{ color: 'var(--muted)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Invoices</span></div>
            <Link href="/dashboard/invoices" className="text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentInvoices.map((inv: any) => (
              <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{inv.client}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{inv.number} · Due {inv.dueDate}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <StatusBadge status={inv.status} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2"><CreditCard size={15} style={{ color: 'var(--muted)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Payments</span></div>
            <Link href="/dashboard/payments" className="text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentPayments.map((p: any) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.client}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{p.reference} · {p.receivedDate}</p>
                </div>
                <span className="text-sm font-semibold shrink-0 ml-3" style={{ color: '#16A34A' }}>+{formatINR(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Brand overview ────────────────────────────────────────────────────────────
function BrandOverview({ brand, name, received, outstanding, overdue, recentInvoices, recentPayments, plan }: any) {
  const isLowBalance    = plan?.model === 'prepaid' && plan?.walletBalance < 5000
  const isSuspended     = plan?.accountStatus === 'suspended'
  const isAtRisk        = plan?.accountStatus === 'at_risk'

  return (
    <div className="p-7 max-w-4xl">

      {/* Welcome */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--subtle)' }}>Welcome back</p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{name}</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{brand} · Q1 2025</p>
      </div>

      {/* Suspension / at-risk banner */}
      {isSuspended && (
        <div className="mb-5 px-4 py-3.5 rounded-xl flex items-start gap-3" style={{ background: 'var(--red-bg)', border: '1px solid #FECACA' }}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--red)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>Account Suspended</p>
            <p className="text-xs mt-0.5" style={{ color: '#B91C1C' }}>Your account has been suspended due to an overdue payment. Please clear the outstanding balance immediately to restore access.</p>
          </div>
        </div>
      )}
      {isAtRisk && !isSuspended && (
        <div className="mb-5 px-4 py-3.5 rounded-xl flex items-start gap-3" style={{ background: 'var(--amber-bg)', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--amber)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--amber)' }}>Payment Overdue</p>
            <p className="text-xs mt-0.5" style={{ color: '#92400E' }}>You have an overdue payment. Your account may be suspended if the balance is not cleared within the grace period. <Link href="/dashboard/invoices" className="underline font-medium">View invoices →</Link></p>
          </div>
        </div>
      )}

      {/* Wallet card — shown for prepaid brands */}
      {plan?.model === 'prepaid' && (
        <div className="mb-5 rounded-xl p-5" style={{ background: 'var(--surface)', border: `1px solid ${isLowBalance ? '#FECACA' : 'var(--border)'}` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={16} style={{ color: 'var(--muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Wallet Balance</span>
              {isLowBalance && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #FECACA' }}>Low Balance</span>
              )}
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'var(--violet)', color: '#fff' }}>
              <Plus size={14} /> Add Balance
            </button>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: isLowBalance ? 'var(--red)' : 'var(--text)' }}>
            {formatINR(plan.walletBalance)}
          </p>
          {isLowBalance && (
            <p className="text-xs mt-1" style={{ color: '#B91C1C' }}>
              Insufficient balance to cover the platform fee. Top up to prevent service interruption.
            </p>
          )}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
            <Link href="/dashboard/payments" className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>
              <CreditCard size={13} /> Wallet Transactions
            </Link>
            <Link href="/dashboard/payments" className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>
              <FileText size={13} /> Get Top-up Receipt
            </Link>
          </div>
        </div>
      )}

      {/* 3 summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Paid',     value: formatINR(received),    sub: 'All time',           accent: '#16A34A', icon: <IndianRupee size={15} /> },
          { label: 'Outstanding',    value: formatINR(outstanding), sub: 'Unpaid invoices',    accent: '#D97706', icon: <Clock size={15} /> },
          { label: 'Overdue Amount', value: formatINR(overdue),     sub: 'Needs immediate attention', accent: '#DC2626', icon: <AlertTriangle size={15} /> },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{m.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.accent + '18', color: m.accent }}>{m.icon}</div>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{m.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Invoices */}
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2"><FileText size={14} style={{ color: 'var(--muted)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Your Invoices</span></div>
            <Link href="/dashboard/invoices" className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>See all <ArrowRight size={12} /></Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentInvoices.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--subtle)' }}>No invoices yet.</p>}
            {recentInvoices.map((inv: any) => (
              <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{inv.number}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Due {inv.dueDate}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <StatusBadge status={inv.status} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2"><CreditCard size={14} style={{ color: 'var(--muted)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment History</span></div>
            <Link href="/dashboard/payments" className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>See all <ArrowRight size={12} /></Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentPayments.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--subtle)' }}>No payments recorded yet.</p>}
            {recentPayments.map((p: any) => (
              <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{p.reference}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{p.receivedDate}</p>
                </div>
                <span className="text-sm font-semibold shrink-0 ml-3" style={{ color: '#16A34A' }}>+{formatINR(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan shortcut */}
      <div className="mt-5 rounded-xl p-5 flex items-center justify-between" style={{ background: 'var(--navy)' }}>
        <div>
          <p className="text-white font-semibold text-sm">Your Plan Details</p>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            {plan?.model === 'prepaid' ? 'Prepaid · Wallet-based' : plan?.model === 'shopify' ? 'Shopify Billing' : `Postpaid · ${plan?.creditCycleDays}-day credit cycle`}
          </p>
        </div>
        <Link href="/dashboard/plan" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-zinc-100"
          style={{ background: '#fff', color: '#000' }}>
          View plan <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getSession()
  const brand   = session?.role === 'brand' ? session.brand : undefined
  const isBrand = !!brand

  const filteredInvoices = isBrand ? invoices.filter(i => i.client === brand) : invoices
  const filteredPayments = isBrand ? payments.filter(p => p.client === brand) : payments
  const { received, outstanding, overdue, pending } = getMetrics(brand)

  const recentInvoices = filteredInvoices.slice(-5).reverse()
  const recentPayments = filteredPayments.slice(-4).reverse()

  if (isBrand) {
    const plan = getBrandPlan(brand!)
    return (
      <BrandOverview
        brand={brand} name={session?.name}
        received={received} outstanding={outstanding} overdue={overdue}
        recentInvoices={recentInvoices} recentPayments={recentPayments}
        plan={plan}
      />
    )
  }

  const reportData = buildReportData()

  return (
    <FinanceOverview
      received={received} outstanding={outstanding} overdue={overdue} pending={pending}
      recentInvoices={recentInvoices} recentPayments={recentPayments}
      reportData={reportData}
    />
  )
}
