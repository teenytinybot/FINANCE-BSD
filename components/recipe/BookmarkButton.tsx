'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { toggleBookmark } from '@/lib/supabase'

export default function BookmarkButton({ recipeId }: { recipeId: string }) {
  const { data: session } = useSession()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleBookmark() {
    if (!session) {
      signIn('google')
      return
    }
    setLoading(true)
    try {
      const isNowSaved = await toggleBookmark(session.user.id, recipeId)
      setSaved(isNowSaved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm transition-colors ${
        saved
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-stone-200 text-stone-500 hover:border-red-300 hover:text-red-400'
      }`}
    >
      <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
