import { createClient } from 'contentful'
import { Recipe } from '@/types'
import { localRecipes } from './local-recipes'

function isContentfulConfigured() {
  const space = process.env.CONTENTFUL_SPACE_ID
  const token = process.env.CONTENTFUL_ACCESS_TOKEN
  return space && token && space !== 'your_contentful_space_id'
}

function getClient() {
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  })
}

function mapContentfulRecipe(entry: any): Recipe {
  const fields = entry.fields
  return {
    id: entry.sys.id,
    title: fields.title,
    slug: fields.slug,
    region: fields.region,
    category: fields.category,
    diet: fields.diet,
    prepTime: fields.prepTime,
    cookTime: fields.cookTime,
    servings: fields.servings,
    description: fields.description,
    ingredients: fields.ingredients,
    steps: fields.steps,
    tags: fields.tags || [],
    thumbnail: {
      url: `https:${fields.thumbnail?.fields?.file?.url}`,
      alt: fields.thumbnail?.fields?.title || fields.title,
    },
  }
}

export async function getAllRecipes(): Promise<Recipe[]> {
  if (!isContentfulConfigured()) return localRecipes

  const entries = await getClient().getEntries({
    content_type: 'recipe',
    order: ['-sys.createdAt'],
  })
  return entries.items.map(mapContentfulRecipe)
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  if (!isContentfulConfigured()) {
    return localRecipes.find((r) => r.slug === slug) ?? null
  }

  const entries = await getClient().getEntries({
    content_type: 'recipe',
    'fields.slug': slug,
    limit: 1,
  })
  if (!entries.items.length) return null
  return mapContentfulRecipe(entries.items[0])
}

export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  if (!isContentfulConfigured()) {
    return localRecipes.filter((r) => r.category === category)
  }

  const entries = await getClient().getEntries({
    content_type: 'recipe',
    'fields.category': category,
  })
  return entries.items.map(mapContentfulRecipe)
}

export async function getRecipesByDiet(diet: string): Promise<Recipe[]> {
  if (!isContentfulConfigured()) {
    return localRecipes.filter((r) => r.diet === diet)
  }

  const entries = await getClient().getEntries({
    content_type: 'recipe',
    'fields.diet': diet,
  })
  return entries.items.map(mapContentfulRecipe)
}
