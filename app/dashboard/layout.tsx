import Sidebar from '@/components/dashboard/Sidebar'
import ChatWidget from '@/components/dashboard/ChatWidget'
import { getSession } from '@/lib/session'
import { getBrandPlan } from '@/lib/mock-data'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const isBrand = session?.role === 'brand'
  const plan    = isBrand && session?.brand ? getBrandPlan(session.brand) : null

  return (
    <div className="flex min-h-screen">
      <Sidebar session={session} />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
      {isBrand && (
        <ChatWidget plan={plan} brand={session?.brand ?? ''} />
      )}
    </div>
  )
}
