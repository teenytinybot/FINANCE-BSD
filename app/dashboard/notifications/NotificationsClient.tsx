'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type ExtensionRequest, type ExtensionStatus, type BrandPlan, formatINR } from '@/lib/mock-data'
import { resolveExtension } from '@/app/actions/extensions'
import {
  Bell, Send, CheckCircle2, XCircle, Clock,
  ExternalLink, ChevronDown, ChevronUp, X, Loader2
} from 'lucide-react'

type Tab = 'extensions' | 'reminder'

const REMINDER_TEMPLATES = [
  {
    id: 'r1',
    label: 'Due date crossed',
    subject: 'Action Required — Invoice Due Date Has Passed',
    body: (brand: string) =>
      `Dear ${brand} Team,\n\nYour invoice due date has crossed and payment has not yet been received. Kindly make the payment at the earliest to avoid any service disruption.\n\nFor queries, reply to this email or contact finance@bitespeed.co.`,
  },
  {
    id: 'r2',
    label: 'Suspension warning',
    subject: 'Urgent: Account Suspension Warning — Awaiting Response',
    body: (brand: string) =>
      `Dear ${brand} Team,\n\nWe have not received a response regarding your outstanding invoice. Please note that your account will get suspended if payment is not received shortly.\n\nKindly act immediately to avoid interruption to your services.\n\nFor queries, contact finance@bitespeed.co.`,
  },
  {
    id: 'r3',
    label: 'MSME dues reminder',
    subject: 'MSME Payment Norms — Please Clear Outstanding Dues',
    body: (brand: string) =>
      `Dear ${brand} Team,\n\nAs per MSME payment norms, outstanding dues must be cleared within the stipulated period. Your invoice is currently overdue under these guidelines.\n\nRequest you to please clear your dues at the earliest to remain compliant.\n\nFor queries, contact finance@bitespeed.co.`,
  },
  {
    id: 'r4',
    label: 'Account suspended',
    subject: 'Account Suspended — Immediate Payment Required',
    body: (brand: string) =>
      `Dear ${brand} Team,\n\nYour account has been suspended due to non-payment and absence of a confirmed due date. All services are currently on hold.\n\nYour services will resume immediately upon receipt of payment. Please take urgent action.\n\nFor queries, contact finance@bitespeed.co.`,
  },
  {
    id: 'r5',
    label: 'Share payment timeline',
    subject: 'Follow-Up: Please Share Payment Timeline',
    body: (brand: string) =>
      `Dear ${brand} Team,\n\nThis is a gentle follow-up regarding your pending invoice. Request you to share a payment timeline at your earliest convenience so we can plan accordingly and avoid any service disruption.\n\nFor queries, reply to this email or contact finance@bitespeed.co.`,
  },
]

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'extensions', label: 'Extension Requests', icon: <Clock size={15} /> },
  { id: 'reminder',   label: 'Send Reminder',      icon: <Send size={15} /> },
]

function StatusPill({ status }: { status: ExtensionStatus }) {
  const map = {
    pending:  { label: 'Pending',  cls: 'badge-pending' },
    approved: { label: 'Approved', cls: 'badge-paid' },
    rejected: { label: 'Rejected', cls: 'badge-overdue' },
  }
  const { label, cls } = map[status]
  return <span className={`${cls} px-2.5 py-0.5 rounded-full text-xs font-medium`}>{label}</span>
}

function ExtensionCard({ req, onAction }: {
  req: ExtensionRequest
  onAction: (id: string, action: 'approved' | 'rejected', note: string) => void
}) {
  const [expanded,   setExpanded]   = useState(req.status === 'pending')
  const [action,     setAction]     = useState<'approved' | 'rejected' | null>(null)
  const [note,       setNote]       = useState('')
  const [done,       setDone]       = useState(req.status !== 'pending')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!action || !note.trim()) return
    setSubmitting(true)
    // Persist to server store
    await resolveExtension(req.id, action, note)
    // Optimistic local update
    onAction(req.id, action, note)
    setDone(true)
    setSubmitting(false)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F5F4F3' }}>
            <Clock size={14} style={{ color: 'var(--muted)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{req.brand}</p>
              <StatusPill status={req.status} />
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>
              {req.invoiceNumber} · {formatINR(req.invoiceAmount)} · Requested {req.requestedAt}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {req.originalDueDate} → <span className="font-semibold" style={{ color: 'var(--text)' }}>{req.requestedDate}</span>
            </p>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>Extension requested</p>
          </div>
          {expanded ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          {/* Reason from brand */}
          <div className="rounded-lg p-4 mb-4" style={{ background: '#F5F4F3', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>Reason from {req.brand}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>"{req.reason}"</p>
          </div>

          {/* Shopify URL */}
          <p className="text-xs mb-4" style={{ color: 'var(--subtle)' }}>
            <ExternalLink size={11} className="inline mr-1" />
            {req.shopifyUrl}
          </p>

          {/* If already resolved */}
          {(req.status !== 'pending' || done) && (
            <div
              className="rounded-lg p-4"
              style={{
                background: req.status === 'approved' ? 'var(--green-bg)' : 'var(--red-bg)',
                border: `1px solid ${req.status === 'approved' ? '#BBF7D0' : '#FECACA'}`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {req.status === 'approved'
                  ? <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />
                  : <XCircle size={14} style={{ color: 'var(--red)' }} />
                }
                <p className="text-xs font-semibold" style={{ color: req.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                  {req.status === 'approved' ? 'Extension Approved' : 'Extension Rejected'}
                  {req.resolvedAt && ` · ${req.resolvedAt}`}
                </p>
              </div>
              <p className="text-xs" style={{ color: req.status === 'approved' ? '#166534' : '#991B1B' }}>
                {req.resolvedNote}
              </p>
            </div>
          )}

          {/* Action area — only for pending */}
          {req.status === 'pending' && !done && (
            <div>
              {/* Action buttons */}
              {!action && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setAction('approved')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid #BBF7D0' }}
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => setAction('rejected')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid #FECACA' }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}

              {/* Note input */}
              {action && (
                <div className="rounded-lg p-4" style={{
                  background: action === 'approved' ? 'var(--green-bg)' : 'var(--red-bg)',
                  border: `1px solid ${action === 'approved' ? '#BBF7D0' : '#FECACA'}`,
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold" style={{ color: action === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                      {action === 'approved' ? 'Approval note' : 'Rejection reason'} <span style={{ color: 'var(--red)' }}>*</span>
                    </p>
                    <button onClick={() => setAction(null)} style={{ color: 'var(--muted)' }}><X size={13} /></button>
                  </div>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder={action === 'approved'
                      ? 'e.g. Approved. Please ensure payment by the new date...'
                      : 'e.g. Rejected. Please clear payment immediately to avoid suspension...'}
                    className="w-full text-sm rounded-lg p-3 outline-none resize-none"
                    style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={submit}
                      disabled={!note.trim() || submitting}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all"
                      style={{
                        background: action === 'approved' ? 'var(--green)' : 'var(--red)',
                        color: '#fff',
                      }}
                    >
                      {submitting && <Loader2 size={13} className="animate-spin" />}
                      Confirm {action === 'approved' ? 'Approval' : 'Rejection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function NotificationsClient({
  requests, brandPlans,
}: { requests: ExtensionRequest[]; brandPlans: BrandPlan[] }) {
  const router = useRouter()
  const [tab,              setTab]             = useState<Tab>('extensions')
  const [reqs,             setReqs]            = useState(requests)
  const [filter,           setFilter]          = useState<ExtensionStatus | 'all'>('all')
  const [shopifyUrl,       setShopify]         = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [sent,             setSent]            = useState(false)

  function handleAction(id: string, action: 'approved' | 'rejected', note: string) {
    setReqs(prev => prev.map(r => r.id === id
      ? { ...r, status: action, resolvedAt: new Date().toISOString().split('T')[0], resolvedNote: note }
      : r
    ))
    router.refresh()
  }

  const filtered = reqs.filter(r => filter === 'all' || r.status === filter)
  const pendingCount = reqs.filter(r => r.status === 'pending').length

  const matchedBrand = brandPlans.find(p =>
    p.shopifyUrl.toLowerCase().includes(shopifyUrl.toLowerCase())
  )

  function sendReminder() {
    if (!shopifyUrl.trim() || !selectedTemplate) return
    setSent(true)
    setTimeout(() => { setSent(false); setShopify(''); setSelectedTemplate(null) }, 3000)
  }

  return (
    <div className="p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Notifications</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Extension requests, payment reminders, and company documents
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px"
            style={{ borderColor: tab === t.id ? 'var(--violet)' : 'transparent', color: tab === t.id ? 'var(--violet)' : 'var(--muted)' }}
          >
            {t.icon}
            {t.label}
            {t.id === 'extensions' && pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: '#DC2626', color: '#fff' }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Extension Requests ── */}
      {tab === 'extensions' && (
        <div>
          {/* Filter */}
          <div className="flex gap-2 mb-5">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: filter === f ? 'var(--violet)' : 'var(--surface)',
                  color:      filter === f ? '#fff' : 'var(--muted)',
                  border:     `1px solid ${filter === f ? 'var(--violet)' : 'var(--border)'}`,
                }}
              >
                {f === 'all' ? `All (${reqs.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${reqs.filter(r => r.status === f).length})`}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-12 rounded-xl" style={{ border: '1px dashed var(--border)' }}>
                <Bell size={24} className="mx-auto mb-3" style={{ color: 'var(--subtle)' }} />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No {filter === 'all' ? '' : filter} requests.</p>
              </div>
            )}
            {filtered.map(req => (
              <ExtensionCard key={req.id} req={req} onAction={handleAction} />
            ))}
          </div>
        </div>
      )}

      {/* ── Send Reminder ── */}
      {tab === 'reminder' && (
        <div className="max-w-lg">
          <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--violet)' }}>
                <Send size={18} style={{ color: '#fff' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Send Payment Reminder</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Select a template and send to the brand immediately</p>
              </div>
            </div>

            {/* Step 1: Shopify URL */}
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                1. Brand / Shopify URL <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                type="text"
                value={shopifyUrl}
                onChange={e => { setShopify(e.target.value); setSelectedTemplate(null) }}
                placeholder="e.g. mamaearth.myshopify.com"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#FAFAFA', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              {shopifyUrl && (
                matchedBrand
                  ? <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--green)' }}>✓ Matched to {matchedBrand.brand}</p>
                  : <p className="text-xs mt-1.5" style={{ color: 'var(--subtle)' }}>No brand matched — double check the URL</p>
              )}
            </div>

            {/* Step 2: Template selector */}
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
                2. Select Reminder Type <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <div className="flex flex-col gap-2">
                {REMINDER_TEMPLATES.map((t, idx) => {
                  const active = selectedTemplate === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(active ? null : t.id)}
                      className="w-full text-left rounded-lg px-3.5 py-3 transition-all flex items-center gap-3"
                      style={{
                        background: active ? '#EEF2FF' : '#FAFAFA',
                        border: `1px solid ${active ? 'var(--violet)' : 'var(--border)'}`,
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: active ? 'var(--violet)' : '#E5E7EB',
                          color: active ? '#fff' : 'var(--muted)',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium" style={{ color: active ? 'var(--violet)' : 'var(--text)' }}>
                        {t.label}
                      </span>
                      {active && <CheckCircle2 size={14} className="ml-auto shrink-0" style={{ color: 'var(--violet)' }} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 3: Preview */}
            {selectedTemplate && (
              <div className="mb-5 rounded-lg p-4" style={{ background: '#F5F4F3', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--muted)' }}>Email preview</p>
                {(() => {
                  const t = REMINDER_TEMPLATES.find(r => r.id === selectedTemplate)!
                  const brand = matchedBrand?.brand ?? 'Brand'
                  return (
                    <>
                      <p className="text-xs mb-3" style={{ color: 'var(--text)' }}>
                        Subject: <strong>{t.subject}</strong>
                      </p>
                      <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text)' }}>
                        {t.body(brand)}
                      </p>
                    </>
                  )
                })()}
              </div>
            )}

            {/* Send / Sent */}
            {sent ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: 'var(--green-bg)', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--green)' }}>Reminder sent successfully!</p>
              </div>
            ) : (
              <button
                onClick={sendReminder}
                disabled={!shopifyUrl.trim() || !selectedTemplate}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all"
                style={{ background: 'var(--violet)', color: '#fff' }}
              >
                <Send size={14} /> Send Reminder
              </button>
            )}
          </div>

          {/* Recently reminded */}
          <div className="mt-5 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Recently reminded</p>
            {[
              { brand: 'NykaaFashion',   url: 'nykaafashion.myshopify.com', date: '2025-03-27', template: 'Due date crossed' },
              { brand: 'Wow Momo Foods', url: 'wowmomo.myshopify.com',      date: '2025-03-25', template: 'Suspension warning' },
              { brand: 'The Good Glamm', url: 'thegoodglamm.myshopify.com', date: '2025-03-24', template: 'Share payment timeline' },
            ].map(r => (
              <div key={r.brand} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.brand}</p>
                  <p className="text-xs" style={{ color: 'var(--subtle)' }}>{r.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{r.template}</p>
                  <p className="text-xs" style={{ color: 'var(--subtle)' }}>{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
