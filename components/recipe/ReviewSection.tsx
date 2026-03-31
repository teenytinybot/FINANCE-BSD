'use client'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Star } from 'lucide-react'
import { getRecipeRatings, addReview } from '@/lib/supabase'

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export default function ReviewSection({ recipeId }: { recipeId: string }) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hovered, setHovered] = useState(0)

  useEffect(() => {
    getRecipeRatings(recipeId)
      .then(setReviews)
      .catch(() => {})
  }, [recipeId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session || rating === 0) return
    setSubmitting(true)
    try {
      const review = await addReview({
        recipe_id: recipeId,
        user_id: session.user.id,
        user_name: session.user.name || 'Anonymous',
        rating,
        comment,
      })
      setReviews((prev) => [review, ...prev])
      setRating(0)
      setComment('')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-stone-800">Reviews</h2>
        {avgRating && (
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star size={16} fill="currentColor" /> {avgRating}
            <span className="text-stone-400 font-normal text-sm">({reviews.length})</span>
          </span>
        )}
      </div>

      {/* Submit form */}
      {session ? (
        <form onSubmit={handleSubmit} className="bg-stone-50 rounded-2xl p-5 mb-8 border border-stone-100">
          <p className="font-medium text-stone-700 mb-3">Leave a review</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={star <= (hovered || rating) ? 'text-amber-400' : 'text-stone-200'}
                  fill={star <= (hovered || rating) ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this recipe..."
            rows={3}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-300 mb-3"
          />
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-full text-sm transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="bg-stone-50 rounded-2xl p-5 mb-8 border border-stone-100 text-center">
          <p className="text-stone-500 mb-3">Sign in to leave a review</p>
          <button
            onClick={() => signIn('google')}
            className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-2 rounded-full text-sm transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-stone-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-700">{review.user_name}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= review.rating ? 'text-amber-400' : 'text-stone-200'}
                    fill={s <= review.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
            </div>
            <p className="text-stone-500 text-sm">{review.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-stone-400 text-sm text-center py-4">No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}
