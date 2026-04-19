"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"

export type Ingredient = {
  amount: string
  unit: string
  name: string
  fdcId?: number
  grams?: number
  // macros (per 100g)
  calories?: number
  protein?: number
  fat?: number
  saturatedFat?: number
  carbs?: number
  sugar?: number
  fiber?: number
  // minerals (mg per 100g)
  cholesterol?: number
  sodium?: number
  potassium?: number
  calcium?: number
  iron?: number
  // vitamins
  vitaminC?: number
  vitaminD?: number
  vitaminA?: number
}

function pf(list: string[], i: number) { return parseFloat(list[i] ?? "") }

function parseIngredients(formData: FormData): Ingredient[] {
  const names        = formData.getAll("ingredientName") as string[]
  const amounts      = formData.getAll("ingredientAmount") as string[]
  const units        = formData.getAll("ingredientUnit") as string[]
  const gramsList    = formData.getAll("ingredientGrams") as string[]
  const fdcIds       = formData.getAll("ingredientFdcId") as string[]
  const caloriesList = formData.getAll("ingredientCalories") as string[]
  const proteinList  = formData.getAll("ingredientProtein") as string[]
  const fatList      = formData.getAll("ingredientFat") as string[]
  const satFatList   = formData.getAll("ingredientSaturatedFat") as string[]
  const carbsList    = formData.getAll("ingredientCarbs") as string[]
  const sugarList    = formData.getAll("ingredientSugar") as string[]
  const fiberList    = formData.getAll("ingredientFiber") as string[]
  const cholList     = formData.getAll("ingredientCholesterol") as string[]
  const sodiumList   = formData.getAll("ingredientSodium") as string[]
  const potassiumList = formData.getAll("ingredientPotassium") as string[]
  const calciumList  = formData.getAll("ingredientCalcium") as string[]
  const ironList     = formData.getAll("ingredientIron") as string[]
  const vitCList     = formData.getAll("ingredientVitaminC") as string[]
  const vitDList     = formData.getAll("ingredientVitaminD") as string[]
  const vitAList     = formData.getAll("ingredientVitaminA") as string[]

  return names
    .map((name, i): Ingredient => {
      const ing: Ingredient = { amount: amounts[i] ?? "", unit: units[i] ?? "", name }
      const grams = pf(gramsList, i)
      const fdcId = parseInt(fdcIds[i] ?? "")
      if (!isNaN(grams) && grams > 0) ing.grams = grams
      if (!isNaN(fdcId)) ing.fdcId = fdcId

      const set = (key: keyof Ingredient, val: number) => { if (!isNaN(val)) (ing as Record<string, unknown>)[key] = val }
      set("calories",    pf(caloriesList, i))
      set("protein",     pf(proteinList, i))
      set("fat",         pf(fatList, i))
      set("saturatedFat",pf(satFatList, i))
      set("carbs",       pf(carbsList, i))
      set("sugar",       pf(sugarList, i))
      set("fiber",       pf(fiberList, i))
      set("cholesterol", pf(cholList, i))
      set("sodium",      pf(sodiumList, i))
      set("potassium",   pf(potassiumList, i))
      set("calcium",     pf(calciumList, i))
      set("iron",        pf(ironList, i))
      set("vitaminC",    pf(vitCList, i))
      set("vitaminD",    pf(vitDList, i))
      set("vitaminA",    pf(vitAList, i))
      return ing
    })
    .filter((i) => i.name.trim())
}

export async function createRecipe(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const servings = parseInt(formData.get("servings") as string) || 4
  const prepTime = parseInt(formData.get("prepTime") as string) || 0
  const cookTime = parseInt(formData.get("cookTime") as string) || 0
  const category = formData.get("category") as string
  const author = formData.get("author") as string

  const ingredients = parseIngredients(formData)
  const instructions = (formData.getAll("instruction") as string[]).filter((s) => s.trim())
  const notes = (formData.get("notes") as string) || null

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
      author: author || null,
      notes,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      imageUrl,
    },
  })

  revalidatePath("/")
  redirect(`/recipes/${recipe.id}`)
}

export async function updateRecipe(id: string, formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const servings = parseInt(formData.get("servings") as string) || 4
  const prepTime = parseInt(formData.get("prepTime") as string) || 0
  const cookTime = parseInt(formData.get("cookTime") as string) || 0
  const category = formData.get("category") as string
  const author = formData.get("author") as string

  const ingredients = parseIngredients(formData)
  const instructions = (formData.getAll("instruction") as string[]).filter((s) => s.trim())
  const notes = (formData.get("notes") as string) || null

  let imageUrl: string | null = (formData.get("existingImageUrl") as string) || null
  const imageFile = formData.get("image") as File | null
  if (imageFile && imageFile.size > 0) {
    const blob = await put(imageFile.name, imageFile, {
      access: "public",
      token: process.env.RECIPEBLOB_READ_WRITE_TOKEN,
    })
    imageUrl = blob.url
  }

  await prisma.recipe.update({
    where: { id },
    data: {
      title,
      description: description || null,
      servings,
      prepTime,
      cookTime,
      category: category || null,
      author: author || null,
      notes,
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      imageUrl,
    },
  })

  revalidatePath("/")
  revalidatePath(`/recipes/${id}`)
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string) {
  await prisma.recipe.delete({ where: { id } })
  revalidatePath("/")
  redirect("/")
}
