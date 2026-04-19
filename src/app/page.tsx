import { prisma } from "@/lib/db"
import Link from "next/link"
import RecipeCard from "@/components/RecipeCard"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900">All Recipes</h1>
        <p className="mt-1 text-amber-700/70">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-200 py-20 text-center">
          <p className="text-lg text-amber-800/60">No recipes yet.</p>
          <Link
            href="/recipes/new"
            className="mt-4 inline-block text-amber-600 underline underline-offset-2 hover:text-amber-800"
          >
            Add your first recipe →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
