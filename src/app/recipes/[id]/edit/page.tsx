import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { updateRecipe } from "@/app/actions"
import RecipeForm from "@/components/RecipeForm"
import type { Ingredient } from "@/app/actions"

export default async function EditRecipePage(props: PageProps<"/recipes/[id]/edit">) {
  const { id } = await props.params
  const recipe = await prisma.recipe.findUnique({ where: { id } })
  if (!recipe) notFound()

  const ingredients: Ingredient[] = JSON.parse(recipe.ingredients)
  const instructions: string[] = JSON.parse(recipe.instructions)

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/recipes/${id}`} className="text-sm text-yellow-600 hover:text-yellow-800">
        ← Back to recipe
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold text-yellow-900">Edit Recipe</h1>
      <RecipeForm
        action={updateRecipe.bind(null, id)}
        initialData={{
          title: recipe.title,
          description: recipe.description,
          servings: recipe.servings,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          category: recipe.category,
          imageUrl: recipe.imageUrl,
          author: recipe.author,
          notes: recipe.notes,
          ingredients,
          instructions,
          rhysRating: recipe.rhysRating,
          rachelRating: recipe.rachelRating,
        }}
        submitLabel="Save Changes"
      />
    </div>
  )
}
