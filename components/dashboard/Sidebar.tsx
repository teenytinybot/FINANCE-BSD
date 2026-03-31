'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { LayoutDashboard, FileText, CreditCard, LogOut, ExternalLink, BookOpen, Clock, GitMerge, Bell, FolderOpen, Eye, Receipt } from 'lucide-react'
import type { Session } from '@/lib/session'

const NAVY = '#0D1B3E'
const BORDER = 'rgba(255,255,255,0.08)'

const financeNav = [
  { href: '/dashboard',                  label: 'Overview',       icon: <LayoutDashboard size={16} /> },
  { href: '/dashboard/notifications',    label: 'Notifications',  icon: <Bell size={16} /> },
  { href: '/dashboard/aging',            label: 'AR Aging',       icon: <Clock size={16} /> },
  { href: '/dashboard/reconciliation',   label: 'Reconciliation', icon: <GitMerge size={16} /> },
  { href: '/dashboard/invoices',         label: 'Invoices',       icon: <FileText size={16} /> },
  { href: '/dashboard/payments',         label: 'Payments',       icon: <CreditCard size={16} /> },
  { href: '/dashboard/docs',             label: 'Company Docs',   icon: <FolderOpen size={16} /> },
  { href: '/dashboard/brand-view',       label: 'Brand View',     icon: <Eye size={16} /> },
]

const brandNav = [
  { href: '/dashboard',          label: 'Overview',    icon: <LayoutDashboard size={16} /> },
  { href: '/dashboard/plan',     label: 'Plan Details', icon: <BookOpen size={16} /> },
  { href: '/dashboard/billing',  label: 'Billing Info', icon: <Receipt size={16} /> },
  { href: '/dashboard/invoices', label: 'Invoices',    icon: <FileText size={16} /> },
  { href: '/dashboard/payments', label: 'Payments',    icon: <CreditCard size={16} /> },
]

export default function Sidebar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const isBrand  = session?.role === 'brand'
  const nav      = isBrand ? brandNav : financeNav

  return (
    <aside
      className="w-56 shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: NAVY, borderRight: `1px solid ${BORDER}` }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#fff' }}>
            <span className="font-black" style={{ fontSize: '11px', color: NAVY }}>B</span>
          </div>
          <span className="text-sm text-white tracking-tight">
            bite<span className="font-black">speed</span>
            <span className="ml-1.5 text-xs font-normal" style={{ color: 'rgba(255,255,255,0.45)' }}>Finance</span>
          </span>
        </div>
      </div>

      {/* User info */}
      {session && (
        <div className="px-4 py-3 border-b" style={{ borderColor: BORDER }}>
          <p className="text-xs font-semibold truncate text-white">{session.name}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {isBrand ? session.brand : 'Finance Team · All brands'}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-0.5 border-t pt-3" style={{ borderColor: BORDER }}>
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <ExternalLink size={15} />
          How it works
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
