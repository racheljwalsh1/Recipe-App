import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { deleteRecipe } from "@/app/actions"
import RecipePDFButton from "@/components/RecipePDF"
import type { Ingredient } from "@/app/actions"

export default async function RecipePage(props: PageProps<"/recipes/[id]">) {
  const { id } = await props.params
  const recipe = await prisma.recipe.findUnique({ where: { id } })
  if (!recipe) notFound()

  const ingredients: Ingredient[] = JSON.parse(recipe.ingredients)
  const instructions: string[] = JSON.parse(recipe.instructions)
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-amber-600 hover:text-amber-800">
            ← All Recipes
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-amber-900">{recipe.title}</h1>
          {recipe.category && (
            <span className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
              {recipe.category}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <RecipePDFButton
            recipe={{
              title: recipe.title,
              description: recipe.description,
              servings: recipe.servings,
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              category: recipe.category,
              imageUrl: recipe.imageUrl,
              ingredients,
              instructions,
            }}
          />
          <form action={deleteRecipe.bind(null, recipe.id)}>
            <button
              type="submit"
              className="rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              onClick={(e) => {
                if (!confirm("Delete this recipe?")) e.preventDefault()
              }}
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {recipe.imageUrl && (
        <div className="relative mb-8 h-72 w-full overflow-hidden rounded-2xl">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {recipe.description && (
        <p className="mb-6 text-amber-800/70 leading-relaxed">{recipe.description}</p>
      )}

      <div className="mb-8 flex gap-6 rounded-2xl bg-amber-50 px-6 py-4 text-sm text-amber-800">
        <div>
          <div className="font-semibold">Servings</div>
          <div>{recipe.servings}</div>
        </div>
        {recipe.prepTime > 0 && (
          <div>
            <div className="font-semibold">Prep</div>
            <div>{recipe.prepTime} min</div>
          </div>
        )}
        {recipe.cookTime > 0 && (
          <div>
            <div className="font-semibold">Cook</div>
            <div>{recipe.cookTime} min</div>
          </div>
        )}
        {totalTime > 0 && (
          <div>
            <div className="font-semibold">Total</div>
            <div>{totalTime} min</div>
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-amber-900">Ingredients</h2>
          <ul className="space-y-2 rounded-2xl border border-amber-100 bg-white p-5">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-24 shrink-0 font-medium text-amber-700">
                  {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                </span>
                <span className="text-amber-900">{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {instructions.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-amber-900">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-amber-900">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
