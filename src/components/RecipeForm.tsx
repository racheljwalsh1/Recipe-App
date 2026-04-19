"use client"

import { useState, useTransition } from "react"
import { createRecipe } from "@/app/actions"

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink", "Other"]

type Ingredient = { amount: string; unit: string; name: string }

export default function RecipeForm() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ amount: "", unit: "", name: "" }])
  const [instructions, setInstructions] = useState<string[]>([""])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { amount: "", unit: "", name: "" }])
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    )
  }

  function addInstruction() {
    setInstructions((prev) => [...prev, ""])
  }

  function removeInstruction(index: number) {
    setInstructions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateInstruction(index: number, value: string) {
    setInstructions((prev) => prev.map((s, i) => (i === index ? value : s)))
  }

  return (
    <form
      action={(formData) => startTransition(() => createRecipe(formData))}
      className="space-y-8"
    >
      {/* Basic info */}
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-amber-900">Basic Info</h2>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="e.g. Classic Banana Bread"
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">Description</label>
          <textarea
            name="description"
            rows={2}
            placeholder="A short description..."
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">Photo</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-amber-800 file:mr-3 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-amber-700 hover:file:bg-amber-200"
          />
          {imagePreview && (
            <div className="mt-3 relative w-full max-w-xs">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-xl object-cover w-full h-48"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  const input = document.querySelector<HTMLInputElement>('input[name="image"]')
                  if (input) input.value = ""
                }}
                className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white hover:bg-black/70"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Servings</label>
            <input
              name="servings"
              type="number"
              min={1}
              defaultValue={4}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Prep (min)</label>
            <input
              name="prepTime"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Cook (min)</label>
            <input
              name="cookTime"
              type="number"
              min={0}
              defaultValue={0}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Category</label>
            <select
              name="category"
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">None</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-amber-900">Ingredients</h2>

        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              name="ingredientAmount"
              value={ing.amount}
              onChange={(e) => updateIngredient(i, "amount", e.target.value)}
              placeholder="Amount"
              className="w-20 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              name="ingredientUnit"
              value={ing.unit}
              onChange={(e) => updateIngredient(i, "unit", e.target.value)}
              placeholder="Unit"
              className="w-20 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              name="ingredientName"
              value={ing.name}
              onChange={(e) => updateIngredient(i, "name", e.target.value)}
              placeholder="Ingredient name"
              className="flex-1 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-red-400 hover:text-red-600 text-lg leading-none"
                aria-label="Remove ingredient"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredient}
          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          + Add ingredient
        </button>
      </section>

      {/* Instructions */}
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-amber-900">Instructions</h2>

        {instructions.map((step, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="mt-2 shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <textarea
              name="instruction"
              value={step}
              onChange={(e) => updateInstruction(i, e.target.value)}
              rows={2}
              placeholder={`Step ${i + 1}`}
              className="flex-1 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeInstruction(i)}
                className="mt-2 text-red-400 hover:text-red-600 text-lg leading-none"
                aria-label="Remove step"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addInstruction}
          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          + Add step
        </button>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-amber-600 px-8 py-3 font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save Recipe"}
        </button>
      </div>
    </form>
  )
}
