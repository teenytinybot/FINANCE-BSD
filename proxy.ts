import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'bs-finance-session'

function parseSession(raw: string | undefined) {
  if (!raw) return null
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const raw      = request.cookies.get(SESSION_COOKIE)?.value
  const session  = parseSession(raw)
  const isAuthed = !!session?.role

  // Redirect logged-in users away from login
  if (pathname === '/login' && isAuthed) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard') && !isAuthed) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
}
