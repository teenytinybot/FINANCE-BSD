'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type AgingRow, type AgingBucket, formatINR } from '@/lib/mock-data'
import { Search, Download, ExternalLink } from 'lucide-react'

const BUCKETS: { key: AgingBucket; label: string; color: string; bg: string; border: string }[] = [
  { key: 'current', label: 'Current',   color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  { key: '1-30',    label: '1–30 days', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  { key: '31-60',   label: '31–60 days',color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  { key: '61-90',   label: '61–90 days',color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { key: '90+',     label: '90+ days',  color: '#7F1D1D', bg: '#FEF2F2', border: '#FCA5A5' },
]

function BucketBadge({ bucket }: { bucket: AgingBucket }) {
  const b = BUCKETS.find(x => x.key === bucket)!
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
      {b.label}
    </span>
  )
}

export default function AgingClient({
  rows, initialBrand, initialShopify,
}: {
  rows: AgingRow[]
  initialBrand: string
  initialShopify: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [brand,   setBrand]   = useState(initialBrand)
  const [shopify, setShopify] = useState(initialShopify)

  function applyFilter() {
    const params = new URLSearchParams()
    if (brand.trim())   params.set('brand',   brand.trim())
    if (shopify.trim()) params.set('shopify', shopify.trim())
    startTransition(() => router.push(`/dashboard/aging?${params.toString()}`))
  }

  function clearFilter() {
    setBrand(''); setShopify('')
    startTransition(() => router.push('/dashboard/aging'))
  }

  // Bucket summary
  const bucketTotals = BUCKETS.map(b => ({
    ...b,
    count:  rows.filter(r => r.bucket === b.key).length,
    amount: rows.filter(r => r.bucket === b.key).reduce((s, r) => s + r.amount, 0),
  }))

  const grandTotal = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>AR Aging Report</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            Accounts receivable by overdue age · As of 29 Mar 2026
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Filter by brand</p>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
            <input
              type="text"
              placeholder="Brand name (e.g. Mamaearth)"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilter()}
              className="w-full pl-8 pr-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#FAFAFA', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
            <input
              type="text"
              placeholder="Shopify URL (e.g. mamaearth.myshopify.com)"
              value={shopify}
              onChange={e => setShopify(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilter()}
              className="w-full pl-8 pr-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#FAFAFA', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilter}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'var(--violet)', color: '#fff' }}
            >
              Search
            </button>
            {(brand || shopify) && (
              <button
                onClick={clearFilter}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-zinc-100"
                style={{ background: 'var(--border)', color: 'var(--muted)' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bucket summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {bucketTotals.map(b => (
          <div key={b.key} className="rounded-xl p-4" style={{ background: b.bg, border: `1px solid ${b.border}` }}>
            <p className="text-xs font-semibold mb-2" style={{ color: b.color }}>{b.label}</p>
            <p className="text-base font-bold" style={{ color: b.color }}>
              {b.amount > 0 ? formatINR(b.amount) : '—'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: b.color, opacity: 0.7 }}>
              {b.count} invoice{b.count !== 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
              <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Brand</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Shopify URL</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Days Overdue</th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Aging</th>
              <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm" style={{ color: 'var(--subtle)' }}>
                  No outstanding invoices match your filter.
                </td>
              </tr>
            )}
            {rows.map(row => {
              const bucket = BUCKETS.find(b => b.key === row.bucket)!
              return (
                <tr key={row.invoiceNumber} className="row-hover transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-medium" style={{ color: 'var(--text)' }}>
                    {row.invoiceNumber}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {row.client}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    {row.shopifyUrl}
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--muted)' }}>
                    {row.dueDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold" style={{ color: bucket.color }}>
                      {row.daysOverdue === 0 ? '—' : `${row.daysOverdue}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <BucketBadge bucket={row.bucket} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {formatINR(row.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length > 0 && (
          <div className="px-5 py-3 flex items-center justify-between border-t"
            style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>
              {rows.length} outstanding invoice{rows.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--red)' }}>
              Total AR: {formatINR(grandTotal)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
