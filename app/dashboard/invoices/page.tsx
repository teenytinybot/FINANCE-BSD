import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import InvoicesClient from './InvoicesClient'
import { invoices, extensionRequests } from '@/lib/mock-data'
import { getSubmissions, getResolution } from '@/lib/extension-store'

export default async function InvoicesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const brand   = session?.role === 'brand' ? session.brand : undefined
  const data    = brand ? invoices.filter(i => i.client === brand) : invoices

  // For brand: merge their static extension requests + any they submitted this session
  // Apply session resolutions to static requests too
  const storeReqs  = brand ? getSubmissions().filter(r => r.brand === brand) : getSubmissions()
  const staticReqs = (brand
    ? extensionRequests.filter(r => r.brand === brand)
    : extensionRequests
  ).map(r => {
    const res = getResolution(r.id)
    return res ? { ...r, ...res } : r
  })

  const allExtReqs = [...storeReqs, ...staticReqs]

  return <InvoicesClient invoices={data} isBrand={!!brand} extensionRequests={allExtReqs} />
}
