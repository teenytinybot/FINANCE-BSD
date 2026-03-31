import BrandViewClient from './BrandViewClient'
import { brandPlans, invoices, payments } from '@/lib/mock-data'

export default async function BrandViewPage() {
  const session = { role: 'finance' as const, name: 'Finance Team' }

  return (
    <BrandViewClient
      brandPlans={brandPlans}
      allInvoices={invoices}
      allPayments={payments}
    />
  )
}
