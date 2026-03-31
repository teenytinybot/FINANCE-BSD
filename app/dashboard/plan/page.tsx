import { getBrandPlan, formatINR, type PaymentModel, type AccountStatus } from '@/lib/mock-data'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { Wallet, Clock, ShoppingBag, CheckCircle2, Calendar, AlertTriangle, Mail } from 'lucide-react'
import Link from 'next/link'

const MODEL_META: Record<PaymentModel, { label: string; tag: string; icon: React.ReactNode; description: string }> = {
  prepaid: {
    label: 'Prepaid',
    tag: 'Wallet-based',
    icon: <Wallet size={20} />,
    description: 'You load credits into your wallet in advance. Usage is deducted in real-time. Service auto-pauses when balance reaches zero — no risk of unexpected debt.',
  },
  postpaid: {
    label: 'Postpaid',
    tag: 'Invoice-based',
    icon: <Clock size={20} />,
    description: 'You use the platform first and are invoiced at the end of your billing cycle. Payment is due within your credit cycle. Late payments may result in account suspension.',
  },
  shopify: {
    label: 'Shopify Billing',
    tag: 'App billing',
    icon: <ShoppingBag size={20} />,
    description: 'Your usage is billed directly through Shopify\'s native billing system. Charges appear on your Shopify invoice — no separate payment needed from your end.',
  },
}

const STATUS_META: Record<AccountStatus, { label: string; color: string; bg: string; border: string; description: string }> = {
  active:    { label: 'Active',    color: '#16A34A', bg: 'var(--green-bg)', border: '#BBF7D0', description: 'Your account is in good standing.' },
  at_risk:   { label: 'At Risk',   color: '#D97706', bg: 'var(--amber-bg)', border: '#FDE68A', description: 'You have an overdue payment. Clear it to avoid suspension.' },
  suspended: { label: 'Suspended', color: '#DC2626', bg: 'var(--red-bg)',   border: '#FECACA', description: 'Account suspended due to non-payment. Contact finance to restore.' },
}

export default async function PlanPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session!.role !== 'brand') redirect('/dashboard')

  const brand = session!.brand!
  const plan  = getBrandPlan(brand)

  if (!plan) redirect('/dashboard')

  const model    = MODEL_META[plan.model]
  const status   = STATUS_META[plan.accountStatus]
  const isPrepaid = plan.model === 'prepaid'

  return (
    <div className="p-7 max-w-3xl">
      <div className="mb-7">
        <Link href="/dashboard" className="text-xs font-medium hover:underline mb-3 inline-block" style={{ color: 'var(--muted)' }}>← Back to overview</Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Plan Details</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{brand} · Billing configuration</p>
      </div>

      {/* Account status */}
      <div className="rounded-xl p-4 mb-5 flex items-start gap-3" style={{ background: status.bg, border: `1px solid ${status.border}` }}>
        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: status.color }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: status.color }}>Account {status.label}</p>
          <p className="text-xs mt-0.5" style={{ color: status.color, opacity: 0.8 }}>{status.description}</p>
        </div>
      </div>

      {/* Payment model */}
      <div className="rounded-xl p-6 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--navy)', color: '#fff' }}>
            {model.icon}
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{model.label}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{model.tag}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{model.description}</p>
      </div>

      {/* Billing details grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Current Billing Period</p>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{plan.billingStart}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>to {plan.billingEnd}</p>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Next Billing Date</p>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{plan.nextBillingDate}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Invoice will be generated</p>
        </div>

        {!isPrepaid && (
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} style={{ color: 'var(--muted)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Credit Cycle</p>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{plan.creditCycleDays} days</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>After invoice date to pay</p>
          </div>
        )}

        {isPrepaid && (
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={14} style={{ color: 'var(--muted)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Wallet Balance</p>
            </div>
            <p className="text-sm font-bold" style={{ color: plan.walletBalance < 5000 ? 'var(--red)' : 'var(--text)' }}>
              {formatINR(plan.walletBalance)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>
              {plan.walletBalance < 5000 ? 'Low — top up recommended' : 'Available balance'}
            </p>
          </div>
        )}

        {plan.platformFee > 0 && (
          <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Platform Fee</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatINR(plan.platformFee)}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Charged at billing cycle start</p>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted)' }}>Active Features</p>
        <div className="flex flex-wrap gap-2">
          {plan.features.map(f => (
            <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: '#F5F5F5', color: 'var(--text)', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={12} style={{ color: '#16A34A' }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Suspension notice */}
      {plan.model === 'postpaid' && (
        <div className="rounded-xl p-5 mb-4" style={{ background: '#FAFAFA', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--amber)' }} />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text)' }}>Account Suspension Policy</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                Your account will be flagged if payment is not received within <strong>{plan.creditCycleDays} days</strong> of invoice date.
                After the grace period, services will be suspended until the outstanding balance is cleared.
                You can request a payment date extension from the <Link href="/dashboard/invoices" className="underline">invoices page</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: 'var(--navy)' }}>
        <div>
          <p className="text-white text-sm font-semibold">Questions about your plan?</p>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Reach out to the BitSpeed finance team</p>
        </div>
        <a href="mailto:finance@bitespeed.co"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-zinc-100"
          style={{ background: '#fff', color: '#000' }}>
          <Mail size={14} /> Contact Finance
        </a>
      </div>
    </div>
  )
}
