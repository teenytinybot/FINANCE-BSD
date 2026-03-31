'use client'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setQuery(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) params.set('q', value.trim())
    else params.delete('q')
    startTransition(() => router.push(`/recipes?${params.toString()}`))
  }

  function clear() {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    router.push(`/recipes?${params.toString()}`)
  }

  return (
    <div className="relative w-full max-w-xl">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: '#B5410E' }} />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search recipes…"
        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none transition-all"
        style={{
          background: '#FFF',
          color: '#1A0800',
          border: '1.5px solid #F0E0D0',
          boxShadow: '0 2px 8px rgba(180,65,14,0.06)',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#B5410E')}
        onBlur={e => (e.currentTarget.style.borderColor = '#F0E0D0')}
      />
      {query && (
        <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A07060' }}>
          <X size={14} />
        </button>
      )}
      {isPending && (
        <span className="absolute right-9 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#B5410E', borderTopColor: 'transparent' }} />
      )}
    </div>
  )
}
