import Sidebar from '@/components/dashboard/Sidebar'
import { Session } from '@/lib/session'

const dummySession: Session = { role: 'finance', name: 'Finance Team' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar session={dummySession} />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
