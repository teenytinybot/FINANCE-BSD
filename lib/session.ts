import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'bs-finance-session'

export interface Session {
  role: 'finance' | 'brand'
  brand?: string   // set only for brand users
  name: string     // display name
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies()
  const raw = jar.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as Session
  } catch {
    return null
  }
}

export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString('base64')
}
