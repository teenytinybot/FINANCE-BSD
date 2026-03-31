import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import BrandViewClient from './BrandViewClient'
import { brandPlans, invoices, payments } from '@/lib/mock-data'

export default async function BrandViewPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session!.role === 'brand') redirect('/dashboard')

  return (
    <BrandViewClient
      brandPlans={brandPlans}
      allInvoices={invoices}
      allPayments={payments}
    />
  )
}
