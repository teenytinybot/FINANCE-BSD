'use client'
import { Search, ExternalLink, X, Loader2, PlayCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import Image from 'next/image'

interface Video {
  videoId: string
  title: string
  channel: string
  thumbnail: string
  url: string
  duration?: string
}

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(value: string) {
    setQuery(value)
    setError('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setVideos([]); setShowResults(false); return }
    debounceRef.current = setTimeout(() => fetchYouTube(value.trim()), 700)
  }

  async function fetchYouTube(q: string) {
    setLoading(true)
    setShowResults(true)
    try {
      const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.error) { setError(data.error); setVideos([]) }
      else setVideos(data.videos || [])
    } catch {
      setError('Could not fetch. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function handleBrowse() {
    if (query.trim()) router.push(`/recipes?q=${encodeURIComponent(query.trim())}`)
  }

  function clear() {
    setQuery(''); setVideos([]); setShowResults(false); setError('')
  }

  return (
    <div className="w-full max-w-2xl relative">
      {/* Input */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-4 pointer-events-none" style={{ color: '#B5410E' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBrowse()}
          placeholder="Search Pahadi recipes… e.g. Siddu, Dham, Babru"
          className="w-full pl-11 pr-32 py-4 rounded-2xl text-sm focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.96)',
            color: '#1A0800',
            border: '1.5px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        />
        {query && (
          <button onClick={clear} className="absolute right-28 p-1" style={{ color: '#A07060' }}>
            <X size={14} />
          </button>
        )}
        <button onClick={handleBrowse}
          className="absolute right-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #B5410E, #E8601A)' }}>
          Search
        </button>
      </div>

      {/* Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-3 rounded-2xl overflow-hidden z-50"
          style={{
            background: '#FFFBF5',
            border: '1px solid #F0E0D0',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          }}>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 size={20} className="animate-spin" style={{ color: '#B5410E' }} />
              <span className="text-sm font-medium" style={{ color: '#6B5344' }}>
                Searching YouTube for Pahadi recipes…
              </span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-3 px-5 py-4 text-sm"
              style={{ background: '#FFF0EE', color: '#8B1A0A', borderBottom: '1px solid #FFD0C8' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Results */}
          {!loading && !error && videos.length > 0 && (
            <>
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: '1px solid #F0E0D0', background: '#FFF8F4' }}>
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#FF0000' }}>
                  <span className="text-white text-[8px] ml-0.5">▶</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B5344' }}>
                  YouTube results for "{query}"
                </span>
              </div>

              {/* Video list */}
              <div>
                {videos.map((v, i) => (
                  <a key={v.videoId} href={v.url} target="_blank" rel="noopener noreferrer"
                    className="flex gap-3 px-4 py-3 group transition-colors"
                    style={{
                      borderBottom: i < videos.length - 1 ? '1px solid #F8EEE8' : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FFF4EC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                    {/* Thumbnail */}
                    <div className="relative rounded-xl overflow-hidden shrink-0 bg-stone-100"
                      style={{ width: '120px', height: '68px' }}>
                      {v.thumbnail && (
                        <Image src={v.thumbnail} alt={v.title} fill className="object-cover" unoptimized />
                      )}
                      {v.duration && (
                        <span className="absolute bottom-1 right-1 text-white text-[10px] font-mono px-1 py-0.5 rounded"
                          style={{ background: 'rgba(0,0,0,0.75)' }}>
                          {v.duration}
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: '#FF0000' }}>
                          <span className="text-white text-xs ml-0.5">▶</span>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-semibold line-clamp-2 leading-snug mb-1 transition-colors group-hover:text-orange-700"
                        style={{ color: '#1A0800' }}>
                        {v.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs" style={{ color: '#A07060' }}>
                        <PlayCircle size={11} className="text-red-500 shrink-0" />
                        <span className="truncate">{v.channel}</span>
                      </p>
                    </div>

                    <ExternalLink size={13} className="shrink-0 mt-1 transition-colors group-hover:text-orange-500"
                      style={{ color: '#D0B8A8' }} />
                  </a>
                ))}
              </div>

              {/* Footer */}
              <button onClick={handleBrowse}
                className="w-full py-3 text-sm font-semibold transition-colors hover:underline"
                style={{ background: '#FFF4EC', color: '#B5410E', borderTop: '1px solid #F0E0D0' }}>
                Search "{query}" in our recipes →
              </button>
            </>
          )}

          {/* Empty */}
          {!loading && !error && videos.length === 0 && query.length > 1 && (
            <div className="py-10 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm font-medium" style={{ color: '#6B5344' }}>No results for "{query}"</p>
              <p className="text-xs mt-1" style={{ color: '#A07060' }}>Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
