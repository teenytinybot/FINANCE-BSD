import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import AgingClient from './AgingClient'
import { getAgingReport } from '@/lib/mock-data'

export default async function AgingPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; shopify?: string }>
}) {
  const session = await getSession()
  if (session?.role !== 'finance') redirect('/dashboard')

  const { brand, shopify } = await searchParams
  const rows = getAgingReport(brand, shopify)

  return <AgingClient rows={rows} initialBrand={brand ?? ''} initialShopify={shopify ?? ''} />
}
