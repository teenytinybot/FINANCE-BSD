import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import { getSession } from '@/lib/session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar session={session} />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
