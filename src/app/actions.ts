"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"

export type Ingredient = { amount: string; unit: string; name: string }

export async function createRecipe(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const servings = parseInt(formData.get("servings") as string) || 4
  const prepTime = parseInt(formData.get("prepTime") as string) || 0
  const cookTime = parseInt(formData.get("cookTime") as string) || 0
  const category = formData.get("category") as string

  const ingredientAmounts = formData.getAll("ingredientAmount") as string[]
  const ingredientUnits = formData.getAll("ingredientUnit") as string[]
  const ingredientNames = formData.getAll("ingredientName") as string[]
  const ingredients: Ingredient[] = ingredientNames
    .map((name, i) => ({
      amount: ingredientAmounts[i] ?? "",
      unit: ingredientUnits[i] ?? "",
      name,
    }))
    .filter((i) => i.name.trim())

  const instructions = (formData.getAll("instruction") as string[]).filter(
    (s) => s.trim()
  )

  let imageUrl: string | null = null
  const imageFile = formData.get("image") as File | null
  if (imageFile && imageFile.size > 0) {
    const blob = await put(imageFile.name, imageFile, {
      access: "public",
      token: process.env.RECIPEBLOB_READ_WRITE_TOKEN,
    })
    imageUrl = blob.url
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description: description || null,
      servings,
      prepTime,
      cookTime,
      category: category || null,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      imageUrl,
    },
  })

  revalidatePath("/")
  redirect(`/recipes/${recipe.id}`)
}

export async function deleteRecipe(id: string) {
  await prisma.recipe.delete({ where: { id } })
  revalidatePath("/")
  redirect("/")
}
