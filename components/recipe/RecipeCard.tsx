import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, ChefHat } from 'lucide-react'
import { Recipe } from '@/types'

const catStyle: Record<string, { bg: string; text: string; label: string }> = {
  main:   { bg: '#FFE8D0', text: '#8B3A0A', label: 'Main Course' },
  staple: { bg: '#FFF4C2', text: '#7A5C00', label: 'Staple' },
  snack:  { bg: '#FFE0E0', text: '#8B1A1A', label: 'Snack' },
  sweet:  { bg: '#FFE0F4', text: '#7A1A5C', label: 'Sweet' },
  drink:  { bg: '#E0EEFF', text: '#1A3A8B', label: 'Drink' },
}

const catEmoji: Record<string, string> = {
  main: '🍛', staple: '🌾', snack: '🥙', sweet: '🍮', drink: '🥛',
}

const placeholderGrad: Record<string, string> = {
  main:   'linear-gradient(135deg, #FFF0E0, #FFD5A8)',
  staple: 'linear-gradient(135deg, #FFFBE0, #FFE88A)',
  snack:  'linear-gradient(135deg, #FFF0EE, #FFCAC0)',
  sweet:  'linear-gradient(135deg, #FFF0F8, #FFD0EC)',
  drink:  'linear-gradient(135deg, #EEF4FF, #C0D8FF)',
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const style = catStyle[recipe.category] || catStyle.main
  const grad  = placeholderGrad[recipe.category] || placeholderGrad.main

  return (
    <Link href={`/recipes/${recipe.slug}`}
      className="card-hover group flex flex-col rounded-2xl overflow-hidden"
      style={{ background: '#FFF', border: '1px solid #F0E0D0', boxShadow: '0 2px 12px rgba(180,65,14,0.06)' }}>

      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden flex-shrink-0" style={{ background: grad }}>
        {recipe.thumbnail?.url ? (
          <Image src={recipe.thumbnail.url} alt={recipe.thumbnail.alt} fill
            className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl opacity-40">
            {catEmoji[recipe.category] || '🍽️'}
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />

        {/* Diet pill */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
          recipe.diet === 'veg'
            ? 'bg-green-600 text-white'
            : 'bg-red-700 text-white'
        }`}>
          {recipe.diet === 'veg' ? '🌿 Veg' : '🍖 Non-veg'}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category chip */}
        <span className="self-start text-xs font-bold px-2.5 py-1 rounded-lg mb-2"
          style={{ background: style.bg, color: style.text }}>
          {catEmoji[recipe.category]} {style.label}
        </span>

        {/* Title */}
        <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg leading-snug mb-1.5 group-hover:text-orange-700 transition-colors"
          style={{ color: '#1A0800' }}>
          {recipe.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-2 mb-4 flex-1" style={{ color: '#6B5344' }}>
          {recipe.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid #F5EAE0' }}>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#A07060' }}>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {recipe.prepTime + recipe.cookTime}m
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} /> {recipe.servings}
            </span>
          </div>
          <span className="text-xs font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all"
            style={{ color: '#B5410E' }}>
            View recipe →
          </span>
        </div>
      </div>
    </Link>
  )
}
