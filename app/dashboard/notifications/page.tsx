import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import NotificationsClient from './NotificationsClient'
import { extensionRequests, brandPlans } from '@/lib/mock-data'
import { getSubmissions, getResolution } from '@/lib/extension-store'

export default async function NotificationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Merge: new store submissions (newest first) + static mock data
  // Apply any resolutions recorded this session to static requests too
  const storeReqs  = getSubmissions()
  const staticReqs = extensionRequests.map(r => {
    const res = getResolution(r.id)
    return res ? { ...r, ...res } : r
  })

  const allRequests = [...storeReqs, ...staticReqs]

  return <NotificationsClient requests={allRequests} brandPlans={brandPlans} />
}
