'use client'

import { useState, useCallback } from 'react'
import { type BankEntry, type Invoice, type Payment, type BrandPlan, formatINR } from '@/lib/mock-data'
import { Upload, CheckCircle2, XCircle, AlertTriangle, Link2, Link2Off, ChevronDown, ChevronUp } from 'lucide-react'

interface MatchMap { [bankId: string]: string }   // bankId → invoiceNumber

function AmountPill({ amount, type }: { amount: number; type: 'credit' | 'debit' }) {
  if (amount === 0) return <span style={{ color: 'var(--subtle)' }}>—</span>
  return (
    <span className="font-semibold text-sm" style={{ color: type === 'credit' ? '#16A34A' : '#DC2626' }}>
      {type === 'credit' ? '+' : '-'}{formatINR(amount)}
    </span>
  )
}

export default function ReconciliationClient({
  bankStatement, outstandingInvoices, recordedPayments, brandPlans,
}: {
  bankStatement:       BankEntry[]
  outstandingInvoices: Invoice[]
  recordedPayments:    Payment[]
  brandPlans:          BrandPlan[]
}) {
  const [uploaded,    setUploaded]    = useState(false)
  const [matches,     setMatches]     = useState<MatchMap>({})
  const [selectedBank, setSelBank]    = useState<string | null>(null)
  const [selectedInv,  setSelInv]     = useState<string | null>(null)
  const [expandBrand,  setExpandBrand]= useState<string | null>(null)

  // Auto-match by reference on "upload"
  const handleUpload = useCallback(() => {
    const autoMatch: MatchMap = {}
    bankStatement.forEach(entry => {
      const recorded = recordedPayments.find(p => p.reference === entry.reference)
      if (recorded) autoMatch[entry.id] = recorded.invoiceNumber
    })
    setMatches(autoMatch)
    setUploaded(true)
  }, [bankStatement, recordedPayments])

  // Manual match: select bank entry + invoice → link
  function doMatch() {
    if (!selectedBank || !selectedInv) return
    setMatches(prev => ({ ...prev, [selectedBank]: selectedInv }))
    setSelBank(null); setSelInv(null)
  }

  function unmatch(bankId: string) {
    setMatches(prev => { const next = { ...prev }; delete next[bankId]; return next })
  }

  // Derive stats
  const creditEntries   = bankStatement.filter(e => e.credit > 0)
  const matchedBankIds  = Object.keys(matches)
  const matchedCount    = matchedBankIds.length
  const unmatchedCount  = creditEntries.length - matchedCount
  const totalBank       = creditEntries.reduce((s, e) => s + e.credit, 0)
  const totalMatched    = matchedBankIds.reduce((s, id) => {
    const e = bankStatement.find(b => b.id === id)
    return s + (e?.credit ?? 0)
  }, 0)
  const totalUnmatched  = totalBank - totalMatched

  // Brand-wise reconciliation
  const brands = [...new Set(outstandingInvoices.map(i => i.client))]
  const brandSummary = brands.map(brand => {
    const plan      = brandPlans.find(p => p.brand === brand)
    const brandInvs = outstandingInvoices.filter(i => i.client === brand)
    const outstanding = brandInvs.reduce((s, i) => s + i.amount, 0)
    const matchedHere = Object.entries(matches)
      .filter(([, inv]) => brandInvs.some(i => i.number === inv))
      .reduce((s, [bankId]) => {
        const e = bankStatement.find(b => b.id === bankId)
        return s + (e?.credit ?? 0)
      }, 0)
    const gap = outstanding - matchedHere
    return { brand, shopifyUrl: plan?.shopifyUrl ?? '—', outstanding, matchedHere, gap, invoices: brandInvs }
  })

  return (
    <div className="p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Reconciliation</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Match bank statement entries against outstanding invoices · Q1 2025
        </p>
      </div>

      {/* Upload area */}
      {!uploaded ? (
        <div
          className="rounded-xl border-2 border-dashed p-12 text-center mb-6 cursor-pointer hover:bg-zinc-50 transition-colors"
          style={{ borderColor: 'var(--border-dark)' }}
          onClick={handleUpload}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: '#F5F5F5' }}>
            <Upload size={22} style={{ color: 'var(--muted)' }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Upload bank statement</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Supports CSV or Excel · Click to simulate upload</p>
          <button
            className="mt-5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'var(--violet)', color: '#fff' }}
          >
            Upload Statement
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Credits (Bank)', value: formatINR(totalBank),      color: 'var(--text)',    sub: `${creditEntries.length} entries` },
              { label: 'Matched',              value: formatINR(totalMatched),   color: '#16A34A',        sub: `${matchedCount} entries linked` },
              { label: 'Unmatched',            value: formatINR(totalUnmatched), color: '#DC2626',        sub: `${unmatchedCount} entries pending` },
              { label: 'Outstanding Invoices', value: formatINR(outstandingInvoices.reduce((s,i)=>s+i.amount,0)), color: '#D97706', sub: `${outstandingInvoices.length} invoices` },
            ].map(c => (
              <div key={c.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>{c.label}</p>
                <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Manual match controls */}
          {(selectedBank || selectedInv) && (
            <div className="rounded-xl p-4 mb-4 flex items-center justify-between"
              style={{ background: 'var(--blue-bg)', border: '1px solid #BFDBFE' }}>
              <div className="flex items-center gap-3 text-sm">
                <Link2 size={15} style={{ color: 'var(--blue)' }} />
                <span style={{ color: 'var(--blue)' }}>
                  {selectedBank ? `Bank entry selected` : 'Select a bank entry'} →{' '}
                  {selectedInv  ? `Invoice ${selectedInv} selected` : 'Select an invoice'}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedBank && selectedInv && (
                  <button onClick={doMatch}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--blue)', color: '#fff' }}>
                    Link
                  </button>
                )}
                <button onClick={() => { setSelBank(null); setSelInv(null) }}
                  className="px-3 py-1.5 rounded-lg text-sm" style={{ color: 'var(--muted)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Side-by-side */}
          <div className="grid grid-cols-2 gap-4 mb-8">

            {/* LEFT: Bank statement */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Bank Statement</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                  {bankStatement.length} entries
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {bankStatement.map(entry => {
                  const isMatched  = !!matches[entry.id]
                  const isSelected = selectedBank === entry.id
                  return (
                    <div
                      key={entry.id}
                      onClick={() => !isMatched && setSelBank(isSelected ? null : entry.id)}
                      className="px-4 py-3 transition-colors"
                      style={{
                        background: isSelected ? '#EFF6FF' : isMatched ? '#F0FDF4' : 'transparent',
                        cursor: isMatched ? 'default' : 'pointer',
                        borderLeft: `3px solid ${isMatched ? '#16A34A' : isSelected ? 'var(--blue)' : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{entry.description}</p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--subtle)' }}>{entry.reference} · {entry.date}</p>
                          {isMatched && (
                            <p className="text-xs mt-0.5 font-medium" style={{ color: '#16A34A' }}>
                              ✓ Matched to {matches[entry.id]}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <AmountPill amount={entry.credit} type="credit" />
                          {isMatched && (
                            <button onClick={e => { e.stopPropagation(); unmatch(entry.id) }}
                              title="Remove match" className="hover:opacity-70">
                              <Link2Off size={13} style={{ color: 'var(--muted)' }} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* RIGHT: Outstanding invoices */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Outstanding Invoices</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                  {outstandingInvoices.length} unpaid
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {outstandingInvoices.map(inv => {
                  const isMatched  = Object.values(matches).includes(inv.number)
                  const isSelected = selectedInv === inv.number
                  return (
                    <div
                      key={inv.id}
                      onClick={() => !isMatched && setSelInv(isSelected ? null : inv.number)}
                      className="px-4 py-3 transition-colors"
                      style={{
                        background: isSelected ? '#EFF6FF' : isMatched ? '#F0FDF4' : 'transparent',
                        cursor: isMatched ? 'default' : 'pointer',
                        borderLeft: `3px solid ${isMatched ? '#16A34A' : isSelected ? 'var(--blue)' : 'transparent'}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{inv.client}</p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--subtle)' }}>{inv.number} · Due {inv.dueDate}</p>
                          {isMatched && (
                            <p className="text-xs mt-0.5 font-medium" style={{ color: '#16A34A' }}>✓ Matched</p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: isMatched ? '#16A34A' : 'var(--text)' }}>
                            {formatINR(inv.amount)}
                          </span>
                          {isMatched
                            ? <CheckCircle2 size={14} style={{ color: '#16A34A' }} />
                            : <XCircle size={14} style={{ color: 'var(--border-dark)' }} />
                          }
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Brand-wise reconciliation */}
          <div>
            <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text)' }}>Brand-wise Reconciliation</h2>
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAFA' }}>
                    <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Brand</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Shopify URL</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Outstanding</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Matched</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Gap</th>
                    <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted)' }}>Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {brandSummary.map(row => (
                    <>
                      <tr key={row.brand} className="row-hover transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium" style={{ color: 'var(--text)' }}>{row.brand}</td>
                        <td className="px-4 py-3.5 text-xs font-mono" style={{ color: 'var(--muted)' }}>{row.shopifyUrl}</td>
                        <td className="px-4 py-3.5 text-right text-sm font-semibold" style={{ color: 'var(--text)' }}>{formatINR(row.outstanding)}</td>
                        <td className="px-4 py-3.5 text-right text-sm font-semibold" style={{ color: '#16A34A' }}>
                          {row.matchedHere > 0 ? formatINR(row.matchedHere) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-semibold" style={{ color: row.gap > 0 ? '#DC2626' : '#16A34A' }}>
                          {row.gap > 0 ? formatINR(row.gap) : '✓ Cleared'}
                        </td>
                        <td className="px-4 py-3.5">
                          {row.gap === 0
                            ? <span className="badge-paid px-2 py-0.5 rounded-full text-xs font-medium">Reconciled</span>
                            : row.matchedHere > 0
                              ? <span className="badge-pending px-2 py-0.5 rounded-full text-xs font-medium">Partial</span>
                              : <span className="badge-overdue px-2 py-0.5 rounded-full text-xs font-medium">Open</span>
                          }
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setExpandBrand(expandBrand === row.brand ? null : row.brand)}
                            className="p-1 hover:bg-zinc-100 rounded transition-colors"
                            style={{ color: 'var(--muted)' }}>
                            {expandBrand === row.brand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expandBrand === row.brand && row.invoices.map(inv => (
                        <tr key={inv.id} style={{ background: '#FAFAFA' }}>
                          <td className="pl-10 pr-4 py-2.5" colSpan={2}>
                            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{inv.number}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{inv.description} · Due {inv.dueDate}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-semibold" style={{ color: 'var(--text)' }}>{formatINR(inv.amount)}</td>
                          <td className="px-4 py-2.5 text-right text-xs" style={{ color: 'var(--subtle)' }}>
                            {Object.values(matches).includes(inv.number) ? <span style={{ color: '#16A34A' }}>✓ Matched</span> : '—'}
                          </td>
                          <td className="px-5 py-2.5 text-right text-xs font-semibold" style={{ color: Object.values(matches).includes(inv.number) ? '#16A34A' : '#DC2626' }}>
                            {Object.values(matches).includes(inv.number) ? '✓' : formatINR(inv.amount)}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border)', background: '#FAFAFA' }}>
                <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                  {brandSummary.filter(b => b.gap === 0).length} of {brandSummary.length} brands fully reconciled
                </span>
                <span className="text-xs font-bold" style={{ color: '#DC2626' }}>
                  Total gap: {formatINR(brandSummary.reduce((s, b) => s + b.gap, 0))}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
