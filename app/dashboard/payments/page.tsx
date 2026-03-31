import PaymentsClient from './PaymentsClient'
import { payments } from '@/lib/mock-data'

export default async function PaymentsPage() {
  const session: import('@/lib/session').Session = { role: 'finance', name: 'Finance Team' }
  const brand   = session?.role === 'brand' ? session.brand : undefined
  const data    = brand ? payments.filter(p => p.client === brand) : payments
  return <PaymentsClient payments={data} isBrand={!!brand} />
}
