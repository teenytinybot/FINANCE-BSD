'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  type Invoice, type Payment, type BrandPlan, type ExtensionRequest,
  formatINR,
} from '@/lib/mock-data'
import {
  Building2, Copy, CheckCircle2, IndianRupee, Clock, AlertTriangle,
  CalendarClock, ArrowRight, CreditCard, FileText, X, CheckCheck, Download, Loader2,
} from 'lucide-react'
import { submitExtensionRequest } from '@/app/actions/extensions'

function downloadLedger(payments: Payment[], brand: string) {
  const headers = ['Date', 'Invoice', 'Method', 'Reference / UTR', 'Amount (INR)', 'Notes']
  const methodMap: Record<string, string> = {
    bank_transfer: 'Bank Transfer', credit_card: 'Credit Card', upi: 'UPI', cheque: 'Cheque',
  }
  const rows = payments.map(p => [p.receivedDate, p.invoiceNumber, methodMap[p.method] ?? p.method, p.reference, p.amount, p.notes])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${brand.replace(/\s+/g, '-').toLowerCase()}-ledger.csv`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// BitSpeed's mock bank details for payment
const BITSPEED_BANK = {
  accountName:   'BitSpeed Technologies Pvt Ltd',
  accountNumber: '9876543210001234',
  ifsc:          'HDFC0001234',
  bank:          'HDFC Bank Ltd',
  branch:        'Koramangala, Bengaluru',
  upi:           'bitespeed@hdfcbank',
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{label}</p>
        <p className="text-sm font-semibold mt-0.5 font-mono" style={{ color: 'var(--text)' }}>{value}</p>
      </div>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: copied ? '#F0FDF4' : '#F5F4F3',
          color:      copied ? '#16A34A' : 'var(--muted)',
          border:     `1px solid ${copied ? '#BBF7D0' : 'var(--border)'}`,
        }}
      >
        {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const map = { paid: { label: 'Paid', cls: 'badge-paid' }, pending: { label: 'Pending', cls: 'badge-pending' }, overdue: { label: 'Overdue', cls: 'badge-overdue' } }
  const { label, cls } = map[status]
  return <span className={`${cls} px-2 py-0.5 rounded-full text-xs font-medium`}>{label}</span>
}

function ExtStatusChip({ status }: { status: ExtensionRequest['status'] }) {
  const map = {
    pending:  { label: 'Ext. Pending',  bg: '#EFF6FF', color: '#2563EB' },
    approved: { label: 'Ext. Approved', bg: '#F0FDF4', color: '#16A34A' },
    rejected: { label: 'Ext. Rejected', bg: '#FEF2F2', color: '#DC2626' },
  }
  const m = map[status]
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: m.bg, color: m.color }}>{m.label}</span>
}

interface Props {
  brand: string
  name: string
  plan: BrandPlan | null
  brandInvoices: Invoice[]
  brandPayments: Payment[]
  extensionRequests: ExtensionRequest[]
}

// Days until due date (negative = overdue)
function daysUntil(dateStr: string): number {
  const today = new Date('2026-03-30')
  const due   = new Date(dateStr)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function BillingClient({ brand, name, plan, brandInvoices, brandPayments, extensionRequests }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [extModal, setExtModal]   = useState<Invoice | null>(null)
  const [reqDate,  setReqDate]    = useState('')
  const [reqReason, setReqReason] = useState('')
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())

  const unpaidInvoices = brandInvoices.filter(i => i.status !== 'paid')
  const overdueInvoices = brandInvoices.filter(i => i.status === 'overdue')
  const totalOutstanding = unpaidInvoices.reduce((s, i) => s + i.amount, 0)
  const totalPaid = brandPayments.reduce((s, p) => s + p.amount, 0)

  // Billing cycle days info
  const cycleStart = plan?.billingStart ? new Date(plan.billingStart) : null
  const cycleEnd   = plan?.billingEnd   ? new Date(plan.billingEnd)   : null
  const totalDays  = (cycleStart && cycleEnd) ? Math.ceil((cycleEnd.getTime() - cycleStart.getTime()) / 86400000) : 0
  const daysUsed   = cycleStart ? Math.min(totalDays, Math.max(0, Math.ceil((new Date('2026-03-30').getTime() - cycleStart.getTime()) / 86400000))) : 0

  function openExt(inv: Invoice) { setExtModal(inv); setReqDate(''); setReqReason('') }

  function submitExt() {
    if (!extModal || !reqDate || reqReason.trim().length < 20) return
    const inv = extModal
    setSubmitted(prev => new Set([...prev, inv.id]))
    setExtModal(null)
    startTransition(async () => {
      await submitExtensionRequest({
        brand:           brand,
        invoiceNumber:   inv.number,
        invoiceAmount:   inv.amount,
        originalDueDate: inv.dueDate,
        requestedDate:   reqDate,
        reason:          reqReason.trim(),
      })
      router.refresh()
    })
  }

  function getExtStatus(inv: Invoice) {
    if (submitted.has(inv.id)) return 'submitted'
    return extensionRequests.find(r => r.invoiceNumber === inv.number)?.status ?? null
  }

  return (
    <div className="p-7 max-w-4xl">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Billing Info</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{brand} · Payment details &amp; account summary</p>
        </div>
        {brandPayments.length > 0 && (
          <button
            onClick={() => downloadLedger(brandPayments, brand)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <Download size={14} /> Download Ledger
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Payment details card */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <Building2 size={14} style={{ color: 'var(--muted)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Pay to BitSpeed</span>
          </div>
          <div className="px-5 py-1">
            <CopyField label="Account Name"   value={BITSPEED_BANK.accountName} />
            <CopyField label="Account Number" value={BITSPEED_BANK.accountNumber} />
            <CopyField label="IFSC Code"      value={BITSPEED_BANK.ifsc} />
            <CopyField label="Bank & Branch"  value={`${BITSPEED_BANK.bank} · ${BITSPEED_BANK.branch}`} />
            <CopyField label="UPI ID"         value={BITSPEED_BANK.upi} />
          </div>
          <div className="px-5 py-3 mx-5 mb-4 rounded-xl text-xs" style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
            Always mention your invoice number in the payment remarks / narration so we can match your payment instantly.
          </div>
        </div>

        {/* Account summary */}
        <div className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Paid',    value: formatINR(totalPaid),        accent: '#16A34A', icon: <IndianRupee size={14} /> },
              { label: 'Outstanding',   value: formatINR(totalOutstanding),  accent: '#D97706', icon: <Clock size={14} /> },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{m.label}</p>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: m.accent + '18', color: m.accent }}>{m.icon}</div>
                </div>
                <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Billing cycle */}
          {plan && (
            <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Billing Cycle</p>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: 'var(--muted)' }}>{plan.billingStart}</span>
                <span style={{ color: 'var(--muted)' }}>{plan.billingEnd}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (daysUsed / totalDays) * 100)}%`, background: 'var(--violet)' }} />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span style={{ color: 'var(--subtle)' }}>{daysUsed} days used</span>
                <span style={{ color: 'var(--subtle)' }}>{totalDays - daysUsed} days left</span>
              </div>
              {plan.model === 'postpaid' && plan.creditCycleDays > 0 && (
                <div className="mt-3 pt-3 border-t flex justify-between text-xs" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--muted)' }}>Credit cycle</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{plan.creditCycleDays} days</span>
                </div>
              )}
              {plan.platformFee > 0 && (
                <div className="mt-2 flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Platform fee</span>
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{formatINR(plan.platformFee)} / month</span>
                </div>
              )}
              <div className="mt-2 flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Next billing date</span>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{plan.nextBillingDate}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outstanding invoices */}
      {unpaidInvoices.length > 0 && (
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <div className="flex items-center gap-2">
              <FileText size={14} style={{ color: 'var(--muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Outstanding Invoices</span>
              {overdueInvoices.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #FECACA' }}>
                  {overdueInvoices.length} overdue
                </span>
              )}
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatINR(totalOutstanding)}</span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {unpaidInvoices.map(inv => {
              const days    = daysUntil(inv.dueDate)
              const extSt   = getExtStatus(inv)
              const hasExt  = !!extSt
              return (
                <div key={inv.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-mono font-medium" style={{ color: 'var(--text)' }}>{inv.number}</p>
                      <StatusBadge status={inv.status} />
                      {extSt === 'submitted' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>Ext. Requested</span>
                      )}
                      {extSt && extSt !== 'submitted' && <ExtStatusChip status={extSt as any} />}
                    </div>
                    <p className="text-xs mt-0.5 truncate max-w-sm" style={{ color: 'var(--muted)' }}>{inv.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: days < 0 ? 'var(--red)' : days <= 7 ? 'var(--amber)' : 'var(--subtle)' }}>
                      {days < 0
                        ? `${Math.abs(days)} days overdue (was ${inv.dueDate})`
                        : days === 0
                        ? `Due today`
                        : `Due in ${days} days (${inv.dueDate})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</span>
                    {!hasExt && (
                      <button
                        onClick={() => openExt(inv)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                      >
                        <CalendarClock size={12} /> Request Extension
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {unpaidInvoices.length === 0 && (
        <div className="rounded-xl p-8 text-center mb-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: '#16A34A' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>All invoices paid</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>No outstanding balance. Great work!</p>
        </div>
      )}

      {/* Recent payments */}
      {brandPayments.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <div className="flex items-center gap-2">
              <CreditCard size={14} style={{ color: 'var(--muted)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Payments</span>
            </div>
            <Link href="/dashboard/payments" className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--muted)' }}>
              View all payments <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {brandPayments.slice(-5).reverse().map(p => (
              <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-medium" style={{ color: 'var(--text)' }}>{p.invoiceNumber}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{p.reference} · {p.receivedDate}</p>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#16A34A' }}>+{formatINR(p.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension request modal */}
      {extModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setExtModal(null) }}
        >
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#fff', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Request Due Date Extension</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{extModal.number} · {formatINR(extModal.amount)}</p>
              </div>
              <button onClick={() => setExtModal(null)} className="p-1.5 rounded-lg hover:bg-zinc-100" style={{ color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="rounded-xl p-4 mb-4" style={{ background: '#FAFAFA', border: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--muted)' }}>Description</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }} className="max-w-[200px] text-right truncate">{extModal.description}</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--muted)' }}>Current due date</span>
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{extModal.dueDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Amount</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatINR(extModal.amount)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                New requested due date <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="date"
                value={reqDate}
                min={extModal.dueDate}
                onChange={e => setReqDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                Reason <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                value={reqReason}
                onChange={e => setReqReason(e.target.value)}
                placeholder="Explain why you need an extension. Be specific — this goes directly to the finance team for review."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>Minimum 20 characters · {reqReason.length}/20</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setExtModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#F5F4F3', color: 'var(--text)' }}
              >
                Cancel
              </button>
              <button
                onClick={submitExt}
                disabled={!reqDate || reqReason.trim().length < 20}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: (!reqDate || reqReason.trim().length < 20) ? '#E5E7EB' : 'var(--violet)',
                  color:      (!reqDate || reqReason.trim().length < 20) ? '#9CA3AF' : '#fff',
                  cursor:     (!reqDate || reqReason.trim().length < 20) ? 'not-allowed' : 'pointer',
                }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
