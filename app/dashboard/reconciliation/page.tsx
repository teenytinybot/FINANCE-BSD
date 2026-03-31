import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import ReconciliationClient from './ReconciliationClient'
import { mockBankStatement, invoices, payments, brandPlans } from '@/lib/mock-data'

export default async function ReconciliationPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Outstanding invoices only (not yet paid)
  const outstanding = invoices.filter(i => i.status !== 'paid')

  return (
    <ReconciliationClient
      bankStatement={mockBankStatement}
      outstandingInvoices={outstanding}
      recordedPayments={payments}
      brandPlans={brandPlans}
    />
  )
}
