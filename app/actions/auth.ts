'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { FINANCE_USER, brandUsers } from '@/lib/mock-data'
import { SESSION_COOKIE, encodeSession } from '@/lib/session'

export async function login(prevState: { error: string } | null, formData: FormData) {
  const email    = formData.get('email')?.toString().trim().toLowerCase() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  let session = null

  // Check finance team
  if (email === FINANCE_USER.email && password === FINANCE_USER.password) {
    session = { role: 'finance' as const, name: 'Finance Team' }
  }

  // Check brand POCs
  if (!session) {
    const brand = brandUsers.find(b => b.email.toLowerCase() === email && b.password === password)
    if (brand) {
      session = { role: 'brand' as const, brand: brand.brand, name: brand.name }
    }
  }

  if (!session) {
    return { error: 'Invalid email or password.' }
  }

  const jar = await cookies()
  jar.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  redirect('/dashboard')
}

export async function logout() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  redirect('/login')
}
