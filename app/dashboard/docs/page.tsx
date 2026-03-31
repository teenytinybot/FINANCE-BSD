import DocsClient from './DocsClient'

export default async function DocsPage() {
  const session = { role: 'finance' as const, name: 'Finance Team' }
  return <DocsClient />
}
