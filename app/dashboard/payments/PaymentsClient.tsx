'use client'

import { useState, useMemo } from 'react'
import { type Payment, type PaymentMethod, formatINR } from '@/lib/mock-data'
import { Download, Search } from 'lucide-react'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  credit_card:   'Credit Card',
  upi:           'UPI',
  cheque:        'Cheque',
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: '#F5F5F5', color: 'var(--muted)', border: '1px solid var(--border)' }}>
      {METHOD_LABELS[method]}
    </span>
  )
}

function downloadCSV(payments: Payment[], isBrand: boolean) {
  const headers = isBrand
    ? ['Date', 'Invoice', 'Method', 'Reference / UTR', 'Amount (INR)', 'Notes']
    : ['Date', 'Invoice', 'Client', 'Method', 'Reference / UTR', 'Amount (INR)', 'Notes']

  const rows = payments.map(p =>
    isBrand
      ? [p.receivedDate, p.invoiceNumber, METHOD_LABELS[p.method], p.reference, p.amount, p.notes]
      : [p.receivedDate, p.invoiceNumber, p.client, METHOD_LABELS[p.method], p.reference, p.amount, p.notes]
  )

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'payment-ledger.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function PaymentsClient({ payments, isBrand }: { payments: Payment[]; isBrand: boolean }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return payments.filter(p =>
      p.client.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q)
    )
  }, [payments, search])

  return (
    <div className="p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Payments</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} received · Q1 2025
          </p>
        </div>
        <button
          onClick={() => downloadCSV(filtered, isBrand)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <Download size={14} /> Download Ledger
        </button>
      </div>

      {/* Method breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map(method => {
          const count  = payments.filter(p => p.method === method).length
          const amount = payments.filter(p => p.method === method).reduce((s, p) => s + p.amount, 0)
          return (
            <div key={method} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>{METHOD_LABELS[method]}</p>
              <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{amount > 0 ? formatINR(amount) : '—'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{count} payment{count !== 1 ? 's' : ''}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
        <input
          type="text"
          placeholder="Search by client, invoice, or reference…"
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
              <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Invoice</th>
              {!isBrand && <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Client</th>}
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Method</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Reference / UTR</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Date</th>
              <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Amount</th>
              <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-sm" style={{ color: 'var(--subtle)' }}>No payments found.</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="row-hover transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs font-medium" style={{ color: 'var(--text)' }}>{p.invoiceNumber}</td>
                {!isBrand && <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text)' }}>{p.client}</td>}
                <td className="px-4 py-3.5"><MethodBadge method={p.method} /></td>
                <td className="px-4 py-3.5 font-mono text-xs" style={{ color: 'var(--muted)' }}>{p.reference}</td>
                <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--muted)' }}>{p.receivedDate}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-sm" style={{ color: '#16A34A' }}>+{formatINR(p.amount)}</td>
                <td className="px-4 py-3.5">
                  <button
                    title="Download receipt"
                    onClick={() => downloadCSV([p], isBrand)}
                    className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Download size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>Showing {filtered.length} of {payments.length}</span>
            <span className="text-xs font-semibold" style={{ color: '#16A34A' }}>Total: {formatINR(filtered.reduce((s, p) => s + p.amount, 0))}</span>
          </div>
        )}
      </div>
    </div>
  )
}
