import type { Recipe } from "@/generated/prisma/client"
import Link from "next/link"
import Image from "next/image"

const CATEGORY_COLORS: Record<string, string> = {
  Breakfast: "bg-yellow-100 text-yellow-800",
  Lunch: "bg-green-100 text-green-800",
  Dinner: "bg-blue-100 text-blue-800",
  Dessert: "bg-pink-100 text-pink-800",
  Snack: "bg-purple-100 text-purple-800",
  Drink: "bg-cyan-100 text-cyan-800",
}

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.prepTime + recipe.cookTime
  const categoryColor =
    recipe.category && CATEGORY_COLORS[recipe.category]
      ? CATEGORY_COLORS[recipe.category]
      : "bg-amber-100 text-amber-800"

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col rounded-2xl border border-amber-100 bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all overflow-hidden"
    >
      {recipe.imageUrl ? (
        <div className="relative h-40 w-full">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-amber-50 flex items-center justify-center text-4xl">
          🍽
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-amber-900 group-hover:text-amber-700 leading-snug">
            {recipe.title}
          </h2>
          {recipe.category && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor}`}>
              {recipe.category}
            </span>
          )}
        </div>

        {recipe.description && (
          <p className="mt-2 text-sm text-amber-800/60 line-clamp-2">{recipe.description}</p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-amber-700/70">
          {totalTime > 0 && <span>⏱ {totalTime} min</span>}
          <span>🍽 {recipe.servings} servings</span>
        </div>
      </div>
    </Link>
  )
}
