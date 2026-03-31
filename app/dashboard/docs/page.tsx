import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import DocsClient from './DocsClient'

export default async function DocsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <DocsClient />
}
