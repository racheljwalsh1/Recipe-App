import RecipeForm from "@/components/RecipeForm"

export const metadata = { title: "New Recipe — My Recipes" }

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-yellow-900">New Recipe</h1>
      <RecipeForm />
    </div>
  )
}
