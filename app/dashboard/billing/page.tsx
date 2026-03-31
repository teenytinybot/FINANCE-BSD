import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { invoices, payments, extensionRequests, getBrandPlan } from '@/lib/mock-data'
import { getSubmissions, getResolution } from '@/lib/extension-store'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const session = await getSession()
  if (!session || session.role !== 'brand') redirect('/dashboard')

  const brand         = session.brand!
  const plan          = getBrandPlan(brand)
  const brandInvoices = invoices.filter(i => i.client === brand)
  const brandPayments = payments.filter(p => p.client === brand)

  // Merge store submissions + static requests, apply session resolutions
  const storeReqs  = getSubmissions().filter(r => r.brand === brand)
  const staticReqs = extensionRequests
    .filter(r => r.brand === brand)
    .map(r => {
      const res = getResolution(r.id)
      return res ? { ...r, ...res } : r
    })

  return (
    <BillingClient
      brand={brand}
      name={session.name}
      plan={plan}
      brandInvoices={brandInvoices}
      brandPayments={brandPayments}
      extensionRequests={[...storeReqs, ...staticReqs]}
    />
  )
}
