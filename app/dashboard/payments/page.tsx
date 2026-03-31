import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import PaymentsClient from './PaymentsClient'
import { payments } from '@/lib/mock-data'

export default async function PaymentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const brand   = session?.role === 'brand' ? session.brand : undefined
  const data    = brand ? payments.filter(p => p.client === brand) : payments
  return <PaymentsClient payments={data} isBrand={!!brand} />
}
