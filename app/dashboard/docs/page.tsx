import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DocsClient from './DocsClient'

export default async function DocsPage() {
  const session = await getSession()
  if (session?.role !== 'finance') redirect('/dashboard')
  return <DocsClient />
}
