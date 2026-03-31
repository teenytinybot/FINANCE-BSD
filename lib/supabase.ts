import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not configured')
  return createClient(url, key)
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase admin env vars not configured')
  return createClient(url, key)
}

// Ratings
export async function getRecipeRatings(recipeId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addReview(review: {
  recipe_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string
}) {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('reviews').insert(review).select().single()
  if (error) throw error
  return data
}

// Bookmarks
export async function getUserBookmarks(userId: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bookmarks')
    .select('recipe_id')
    .eq('user_id', userId)
  if (error) throw error
  return data?.map((b: { recipe_id: string }) => b.recipe_id) || []
}

export async function toggleBookmark(userId: string, recipeId: string) {
  const supabase = getSupabase()
  const existing = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single()

  if (existing.data) {
    await supabase.from('bookmarks').delete().eq('id', existing.data.id)
    return false
  } else {
    await supabase.from('bookmarks').insert({ user_id: userId, recipe_id: recipeId })
    return true
  }
}

// Community submissions
export async function submitCommunityRecipe(recipe: Record<string, unknown>) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('community_recipes')
    .insert({ ...recipe, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return data
}

// Used in auth callback
export { getSupabaseAdmin }
