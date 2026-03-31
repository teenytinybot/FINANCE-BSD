'use client'

import { useState, useMemo, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { type Invoice, type InvoiceStatus, type ExtensionRequest, formatINR } from '@/lib/mock-data'
import { submitExtensionRequest } from '@/app/actions/extensions'
import { Download, Search, Bell, CalendarClock, X, CheckCircle2, XCircle, Clock, Loader2, ChevronDown } from 'lucide-react'

const REMINDER_TEMPLATES = [
  {
    id: 'r1',
    label: 'Due date crossed',
    message: 'Dear {client}, your invoice {number} of {amount} was due on {dueDate}. The due date has now crossed. Kindly make the payment at the earliest to avoid service disruption.',
  },
  {
    id: 'r2',
    label: 'Suspension warning',
    message: 'Dear {client}, we have not received a response regarding your outstanding invoice {number} of {amount}. Please note that your account will get suspended if payment is not received shortly. Kindly act immediately.',
  },
  {
    id: 'r3',
    label: 'MSME dues reminder',
    message: 'Dear {client}, as per MSME payment norms, dues must be cleared within the stipulated period. Your invoice {number} of {amount} (due {dueDate}) is currently outstanding. Request you to please clear dues at the earliest.',
  },
  {
    id: 'r4',
    label: 'Account suspended',
    message: 'Dear {client}, your account has been suspended due to non-payment of invoice {number} ({amount}) and absence of a confirmed due date. Services will resume immediately upon payment. Please take urgent action.',
  },
  {
    id: 'r5',
    label: 'Share payment timeline',
    message: 'Dear {client}, this is a gentle follow-up regarding your pending invoice {number} of {amount} due on {dueDate}. Request you to share a payment timeline so we can plan accordingly and avoid any service disruption.',
  },
]

function fillTemplate(template: string, inv: Invoice) {
  return template
    .replace('{client}', inv.client)
    .replace('{number}', inv.number)
    .replace('{amount}', formatINR(inv.amount))
    .replace(/{dueDate}/g, inv.dueDate)
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const map = {
    paid:    { label: 'Paid',    cls: 'badge-paid' },
    pending: { label: 'Pending', cls: 'badge-pending' },
    overdue: { label: 'Overdue', cls: 'badge-overdue' },
  }
  const { label, cls } = map[status]
  return <span className={`${cls} px-2.5 py-0.5 rounded-full text-xs font-medium`}>{label}</span>
}

function ExtStatusBadge({ status }: { status: ExtensionRequest['status'] | 'local' }) {
  const map = {
    local:    { label: 'Requested', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    pending:  { label: 'Ext. Pending', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
    approved: { label: 'Ext. Approved', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    rejected: { label: 'Ext. Rejected', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  }
  const m = map[status]
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      {m.label}
    </span>
  )
}

const TABS: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'paid',    label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
]

interface ExtModal { invoice: Invoice }

export default function InvoicesClient({
  invoices,
  isBrand,
  extensionRequests = [],
}: {
  invoices: Invoice[]
  isBrand: boolean
  extensionRequests?: ExtensionRequest[]
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Reminder dropdown state
  const [reminderOpen, setReminderOpen] = useState<string | null>(null)  // invoice id
  const [sentReminder, setSentReminder] = useState<string | null>(null)  // invoice id
  const reminderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (reminderRef.current && !reminderRef.current.contains(e.target as Node)) {
        setReminderOpen(null)
      }
    }
    if (reminderOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [reminderOpen])

  function sendReminder(inv: Invoice, templateId: string) {
    const template = REMINDER_TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    // Copy filled message to clipboard
    const msg = fillTemplate(template.message, inv)
    navigator.clipboard.writeText(msg).catch(() => {})
    setReminderOpen(null)
    setSentReminder(inv.id)
    setTimeout(() => setSentReminder(null), 2000)
  }

  // Extension request modal state
  const [extModal, setExtModal]   = useState<ExtModal | null>(null)
  const [reqDate,  setReqDate]    = useState('')
  const [reqReason, setReqReason] = useState('')
  // Track locally submitted requests for optimistic UI
  const [localSubmitted, setLocalSubmitted] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => invoices.filter(inv => {
    const q = search.toLowerCase()
    const matchSearch = inv.client.toLowerCase().includes(q) || inv.number.toLowerCase().includes(q)
    const matchStatus = status === 'all' || inv.status === status
    return matchSearch && matchStatus
  }), [invoices, search, status])

  function openExtModal(inv: Invoice) {
    setExtModal({ invoice: inv })
    setReqDate('')
    setReqReason('')
  }

  function submitExtension() {
    if (!extModal || !reqDate || reqReason.trim().length < 20) return
    const inv = extModal.invoice
    // Optimistic UI — show badge immediately
    setLocalSubmitted(prev => new Set([...prev, inv.id]))
    setExtModal(null)
    // Persist to server + notify admin
    startTransition(async () => {
      await submitExtensionRequest({
        brand:           inv.client,
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
    if (localSubmitted.has(inv.id)) return 'local' as const
    const existing = extensionRequests.find(r => r.invoiceNumber === inv.number)
    return existing?.status ?? null
  }

  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Invoices</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} · Q1 2025
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <Download size={14} /> Download all (ZIP)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(t => {
          const count  = t.value === 'all' ? invoices.length : invoices.filter(i => i.status === t.value).length
          const active = status === t.value
          return (
            <button
              key={t.value}
              onClick={() => setStatus(t.value)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px"
              style={{ borderColor: active ? 'var(--violet)' : 'transparent', color: active ? 'var(--violet)' : 'var(--muted)' }}
            >
              {t.label}
              <span className="px-1.5 py-0.5 rounded-md text-xs font-semibold"
                style={{ background: active ? 'var(--violet)' : 'var(--border)', color: active ? '#fff' : 'var(--muted)' }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
        <input
          type="text"
          placeholder="Search by invoice number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3.5 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
              <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Invoice #</th>
              {!isBrand && <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Client</th>}
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Issued</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Amount</th>
              <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-sm" style={{ color: 'var(--subtle)' }}>No invoices match your search.</td></tr>
            )}
            {filtered.map(inv => {
              const extStatus = getExtStatus(inv)
              return (
                <tr key={inv.id} className="row-hover transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-medium" style={{ color: 'var(--text)' }}>{inv.number}</td>
                  {!isBrand && <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text)' }}>{inv.client}</td>}
                  <td className="px-4 py-3.5 text-xs max-w-[180px] truncate" style={{ color: 'var(--muted)' }}>{inv.description}</td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--muted)' }}>{inv.issuedDate}</td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: inv.status === 'overdue' ? 'var(--red)' : 'var(--muted)' }}>{inv.dueDate}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusBadge status={inv.status} />
                      {extStatus && <ExtStatusBadge status={extStatus} />}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-sm" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button title="Download PDF" className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors" style={{ color: 'var(--muted)' }}><Download size={13} /></button>
                      {inv.status !== 'paid' && !isBrand && (
                        <div className="relative" ref={reminderOpen === inv.id ? reminderRef : null}>
                          <button
                            title="Send reminder"
                            onClick={() => setReminderOpen(prev => prev === inv.id ? null : inv.id)}
                            className="flex items-center gap-0.5 p-1.5 rounded-md transition-colors"
                            style={{
                              color: sentReminder === inv.id ? '#16A34A' : 'var(--amber)',
                              background: reminderOpen === inv.id ? '#FFF7ED' : 'transparent',
                            }}
                          >
                            {sentReminder === inv.id
                              ? <CheckCircle2 size={13} />
                              : <Bell size={13} />
                            }
                            <ChevronDown size={10} style={{ opacity: 0.6, transform: reminderOpen === inv.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          </button>

                          {reminderOpen === inv.id && (
                            <div
                              className="absolute z-50 rounded-xl shadow-xl"
                              style={{
                                top: '100%', right: 0, marginTop: 4,
                                width: 310,
                                background: '#fff',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                              }}
                            >
                              <div className="px-3.5 py-2.5 border-b" style={{ borderColor: '#F0F0F0' }}>
                                <p className="text-xs font-semibold" style={{ color: '#374151' }}>Send Reminder</p>
                                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Message will be copied to clipboard</p>
                              </div>
                              <div className="py-1">
                                {REMINDER_TEMPLATES.map((t, idx) => (
                                  <button
                                    key={t.id}
                                    onClick={() => sendReminder(inv, t.id)}
                                    className="w-full text-left px-3.5 py-2.5 transition-colors hover:bg-amber-50 flex items-start gap-2.5"
                                  >
                                    <span
                                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                                      style={{ background: '#FEF3C7', color: '#D97706' }}
                                    >
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <p className="text-xs font-semibold" style={{ color: '#111827' }}>{t.label}</p>
                                      <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: '#6B7280' }}>
                                        {fillTemplate(t.message, inv).slice(0, 90)}…
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {(inv.status === 'pending' || inv.status === 'overdue') && !extStatus && (
                        <button
                          title={isBrand ? 'Request extension' : 'Log extension'}
                          onClick={() => openExtModal(inv)}
                          className="p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                          style={{ color: 'var(--blue)' }}
                        >
                          <CalendarClock size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>Showing {filtered.length} of {invoices.length}</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Total: {formatINR(filtered.reduce((s, i) => s + i.amount, 0))}</span>
          </div>
        )}
      </div>

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
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {extModal.invoice.number} · {formatINR(extModal.invoice.amount)}
                </p>
              </div>
              <button onClick={() => setExtModal(null)} className="p-1.5 rounded-lg hover:bg-zinc-100" style={{ color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Invoice summary */}
            <div className="rounded-xl p-4 mb-5" style={{ background: '#FAFAFA', border: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--muted)' }}>Description</span>
                <span style={{ color: 'var(--text)' }} className="font-medium max-w-[200px] text-right truncate">{extModal.invoice.description}</span>
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--muted)' }}>Current due date</span>
                <span style={{ color: 'var(--red)', fontWeight: 600 }}>{extModal.invoice.dueDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>Amount</span>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatINR(extModal.invoice.amount)}</span>
              </div>
            </div>

            {/* New date */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                Requested new due date <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="date"
                value={reqDate}
                min={extModal.invoice.dueDate}
                onChange={e => setReqDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            {/* Reason */}
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                Reason for extension <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <textarea
                value={reqReason}
                onChange={e => setReqReason(e.target.value)}
                placeholder="e.g. Our finance team is undergoing an internal audit this week. We will clear the payment by the requested date."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                Minimum 20 characters. {reqReason.length}/20
              </p>
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
                onClick={submitExtension}
                disabled={!reqDate || reqReason.trim().length < 20}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
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
