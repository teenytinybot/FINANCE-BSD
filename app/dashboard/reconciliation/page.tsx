import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ReconciliationClient from './ReconciliationClient'
import { mockBankStatement, invoices, payments, brandPlans } from '@/lib/mock-data'

export default async function ReconciliationPage() {
  const session = await getSession()
  if (session?.role !== 'finance') redirect('/dashboard')

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
