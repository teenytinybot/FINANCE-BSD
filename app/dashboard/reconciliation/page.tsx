import ReconciliationClient from './ReconciliationClient'
import { mockBankStatement, invoices, payments, brandPlans } from '@/lib/mock-data'

export default async function ReconciliationPage() {
  const session = { role: 'finance' as const, name: 'Finance Team' }

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
