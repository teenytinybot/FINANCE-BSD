'use client'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { UtensilsCrossed, User, LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,251,245,0.95)' : '#FFFBF5',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${scrolled ? '#F0E0D0' : '#F0E0D0'}`,
        boxShadow: scrolled ? '0 4px 24px rgba(180,65,14,0.08)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #B5410E, #E8601A)' }}>
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <div>
            <span className="font-[family-name:var(--font-playfair)] font-bold text-lg leading-none"
              style={{ color: '#1A0800' }}>
              Pahadi Recipes
            </span>
            <span className="block text-xs leading-none mt-0.5" style={{ color: '#B5410E' }}>
              Himachal Pradesh
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/recipes"
            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-orange-50"
            style={{ color: '#3D1A0A' }}>
            Browse Recipes
          </Link>
          <Link href="/submit"
            className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-orange-50"
            style={{ color: '#3D1A0A' }}>
            Submit Recipe
          </Link>

          <div className="w-px h-5 bg-orange-200 mx-2" />

          {session ? (
            <div className="flex items-center gap-1">
              <Link href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all hover:bg-orange-50"
                style={{ color: '#3D1A0A' }}>
                <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center">
                  <User size={13} style={{ color: '#B5410E' }} />
                </div>
                {session.user?.name?.split(' ')[0]}
              </Link>
              <button onClick={() => signOut()}
                className="p-2 rounded-full hover:bg-red-50 transition-all"
                title="Sign out">
                <LogOut size={16} className="text-stone-400 hover:text-red-400" />
              </button>
            </div>
          ) : (
            <button onClick={() => signIn('google')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #B5410E, #E8601A)' }}>
              Sign in
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-orange-200 transition-colors hover:bg-orange-50">
          {menuOpen ? <X size={18} style={{ color: '#B5410E' }} /> : <Menu size={18} style={{ color: '#B5410E' }} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-5 py-4 flex flex-col gap-1 border-t border-orange-100" style={{ background: '#FFFBF5' }}>
          {[
            { href: '/recipes', label: 'Browse Recipes' },
            { href: '/submit', label: 'Submit a Recipe' },
            { href: '/profile', label: 'My Profile' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
              style={{ color: '#3D1A0A' }}>
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-orange-100 mt-1">
            {session ? (
              <button onClick={() => signOut()} className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                Sign out
              </button>
            ) : (
              <button onClick={() => signIn('google')}
                className="w-full text-center py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #B5410E, #E8601A)' }}>
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
