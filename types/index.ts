export interface Recipe {
  id: string
  title: string
  slug: string
  region: string
  category: 'main' | 'snack' | 'sweet' | 'staple' | 'drink'
  diet: 'veg' | 'non-veg'
  prepTime: number
  cookTime: number
  servings: number
  description: string
  ingredients: string[]
  steps: string[]
  tags: string[]
  thumbnail: {
    url: string
    alt: string
  }
  isCommuitySubmitted?: boolean
}

export interface Review {
  id: string
  recipeId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  bookmarks: string[]
}

export interface CommunityRecipe extends Omit<Recipe, 'id' | 'slug'> {
  id?: string
  submittedBy: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
