import AgingClient from './AgingClient'
import { getAgingReport } from '@/lib/mock-data'

export default async function AgingPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; shopify?: string }>
}) {
  const session = { role: 'finance' as const, name: 'Finance Team' }

  const { brand, shopify } = await searchParams
  const rows = getAgingReport(brand, shopify)

  return <AgingClient rows={rows} initialBrand={brand ?? ''} initialShopify={shopify ?? ''} />
}
