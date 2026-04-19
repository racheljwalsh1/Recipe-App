"use client"

import { deleteRecipe } from "@/app/actions"

export default function DeleteRecipeButton({ id }: { id: string }) {
  return (
    <form action={deleteRecipe.bind(null, id)}>
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
  )
}
