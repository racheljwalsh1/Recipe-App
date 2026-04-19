import { prisma } from "@/lib/db"
import Link from "next/link"
import RecipeCard from "@/components/RecipeCard"
import RecipeFilters from "@/components/RecipeFilters"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function HomePage(props: PageProps<"/">) {
  const sp = await props.searchParams

  const q = (sp.q as string) || ""
  const ingredients = ((sp.ingredient as string) || "").split(",").filter(Boolean)
  const category = (sp.category as string) || ""
  const author = (sp.author as string) || ""
  const hp = sp.hp === "1"
  const lc = sp.lc === "1"
  const ratingBy = (sp.ratingBy as string) || ""
  const minRating = parseInt(sp.minRating as string) || 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = []

  if (q) {
    conditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    })
  }

  for (const ingredient of ingredients) {
    conditions.push({ ingredients: { contains: ingredient, mode: "insensitive" } })
  }

  if (category) {
    conditions.push({ category: { equals: category } })
  }

  if (author) {
    conditions.push({ author: { contains: author, mode: "insensitive" } })
  }

  if (hp) {
    conditions.push({ tags: { has: "High Protein" } })
  }

  if (lc) {
    conditions.push({ tags: { has: "Low Calorie" } })
  }

  if (minRating >= 1 && minRating <= 5 && ratingBy) {
    if (ratingBy === "rhys") {
      conditions.push({ rhysRating: { gte: minRating } })
    } else if (ratingBy === "rachel") {
      conditions.push({ rachelRating: { gte: minRating } })
    }
  }

  const [recipes, totalCount, authorsResult] = await Promise.all([
    prisma.recipe.findMany({
      where: conditions.length > 0 ? { AND: conditions } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.recipe.count(),
    prisma.recipe.findMany({
      select: { author: true },
      distinct: ["author"],
      where: { author: { not: null } },
      orderBy: { author: "asc" },
    }),
  ])

  const authors = authorsResult.map((r) => r.author).filter((a): a is string => a !== null)
  const isFiltering = conditions.length > 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-900">All Recipes</h1>
        <p className="mt-1 text-amber-700/70">
          {totalCount} recipe{totalCount !== 1 ? "s" : ""} saved
        </p>
      </div>

      <Suspense>
        <RecipeFilters authors={authors} totalCount={totalCount} filteredCount={recipes.length} />
      </Suspense>

      {recipes.length === 0 ? (
        isFiltering ? (
          <div className="rounded-2xl border-2 border-dashed border-amber-200 py-20 text-center">
            <p className="text-lg text-amber-800/60">No recipes match your filters.</p>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-amber-200 py-20 text-center">
            <p className="text-lg text-amber-800/60">No recipes yet.</p>
            <Link
              href="/recipes/new"
              className="mt-4 inline-block text-amber-600 underline underline-offset-2 hover:text-amber-800"
            >
              Add your first recipe →
            </Link>
          </div>
        )
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
