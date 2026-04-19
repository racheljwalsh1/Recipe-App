"use client"

import { useState, useTransition, useRef } from "react"
import { createRecipe } from "@/app/actions"
import type { Ingredient } from "@/app/actions"
import NotesEditor from "@/components/NotesEditor"

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink", "Other"]
const AUTHORS = ["Rachel", "Rhys"]

type FoodResult = {
  fdcId: number
  name: string
  calories: number
  protein: number
  fat: number
  saturatedFat: number
  carbs: number
  sugar: number
  fiber: number
  cholesterol: number
  sodium: number
  potassium: number
  calcium: number
  iron: number
  vitaminC: number
  vitaminD: number
  vitaminA: number
}

type FoodPortion = {
  description: string
  grams: number
}

type IngredientRow = Ingredient & {
  _results: FoodResult[]
  _open: boolean
  _loading: boolean
  _portions: FoodPortion[]
  _portionsLoading: boolean
}

type InitialData = {
  title: string
  description: string | null
  servings: number
  prepTime: number
  cookTime: number
  category: string | null
  imageUrl: string | null
  author: string | null
  notes: string | null
  ingredients: Ingredient[]
  instructions: string[]
}

type Props = {
  action?: (formData: FormData) => Promise<void>
  initialData?: InitialData
  submitLabel?: string
}

function toRow(ing: Ingredient): IngredientRow {
  return { ...ing, _results: [], _open: false, _loading: false, _portions: [], _portionsLoading: false }
}

export default function RecipeForm({ action = createRecipe, initialData, submitLabel = "Save Recipe" }: Props) {
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData?.ingredients.length
      ? initialData.ingredients.map(toRow)
      : [toRow({ amount: "", unit: "", name: "" })]
  )
  const [instructions, setInstructions] = useState<string[]>(
    initialData?.instructions.length ? initialData.instructions : [""]
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialData?.imageUrl ?? null)
  const [notes, setNotes] = useState<string>(initialData?.notes ?? "")
  const [isPending, startTransition] = useTransition()
  const searchTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const displayImage = imagePreview ?? existingImageUrl

  function patch(index: number, updates: Partial<IngredientRow>) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, ...updates } : ing)))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      setExistingImageUrl(null)
    } else {
      setImagePreview(null)
    }
  }

  function removeImage() {
    setImagePreview(null)
    setExistingImageUrl(null)
    const input = document.querySelector<HTMLInputElement>('input[name="image"]')
    if (input) input.value = ""
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, toRow({ amount: "", unit: "", name: "" })])
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  function handleNameInput(index: number, value: string) {
    patch(index, {
      name: value,
      fdcId: undefined,
      calories: undefined,
      protein: undefined,
      fat: undefined,
      saturatedFat: undefined,
      carbs: undefined,
      sugar: undefined,
      fiber: undefined,
      cholesterol: undefined,
      sodium: undefined,
      potassium: undefined,
      calcium: undefined,
      iron: undefined,
      vitaminC: undefined,
      vitaminD: undefined,
      vitaminA: undefined,
      _open: false,
    })

    const existing = searchTimers.current.get(index)
    if (existing) clearTimeout(existing)

    if (value.trim().length < 2) {
      patch(index, { _results: [], _loading: false })
      return
    }

    patch(index, { _loading: true })
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(value.trim())}`)
        const results: FoodResult[] = await res.json()
        patch(index, { _results: results, _open: results.length > 0, _loading: false })
      } catch {
        patch(index, { _loading: false })
      }
      searchTimers.current.delete(index)
    }, 400)
    searchTimers.current.set(index, timer)
  }

  async function selectFood(index: number, food: FoodResult) {
    patch(index, {
      name: food.name,
      fdcId: food.fdcId,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      saturatedFat: food.saturatedFat,
      carbs: food.carbs,
      sugar: food.sugar,
      fiber: food.fiber,
      cholesterol: food.cholesterol,
      sodium: food.sodium,
      potassium: food.potassium,
      calcium: food.calcium,
      iron: food.iron,
      vitaminC: food.vitaminC,
      vitaminD: food.vitaminD,
      vitaminA: food.vitaminA,
      grams: undefined,
      _results: [],
      _open: false,
      _loading: false,
      _portions: [],
      _portionsLoading: true,
    })
    try {
      const res = await fetch(`/api/foods/${food.fdcId}`)
      const data = await res.json()
      patch(index, { _portions: data.portions ?? [], _portionsLoading: false })
    } catch {
      patch(index, { _portionsLoading: false })
    }
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
      action={(formData) => startTransition(() => action(formData))}
      className="space-y-8"
    >
      <input type="hidden" name="existingImageUrl" value={existingImageUrl ?? ""} />
      <input type="hidden" name="notes" value={notes} />

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
            defaultValue={initialData?.title}
            placeholder="e.g. Classic Banana Bread"
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={initialData?.description ?? ""}
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
          {displayImage && (
            <div className="mt-3 relative w-full max-w-xs">
              <img src={displayImage} alt="Preview" className="rounded-xl object-cover w-full h-48" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white hover:bg-black/70"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Servings</label>
            <input
              name="servings"
              type="number"
              min={1}
              defaultValue={initialData?.servings ?? 4}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Prep (min)</label>
            <input
              name="prepTime"
              type="number"
              min={0}
              defaultValue={initialData?.prepTime ?? 0}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Cook (min)</label>
            <input
              name="cookTime"
              type="number"
              min={0}
              defaultValue={initialData?.cookTime ?? 0}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Category</label>
            <select
              name="category"
              defaultValue={initialData?.category ?? ""}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">None</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Made by</label>
            <select
              name="author"
              defaultValue={initialData?.author ?? ""}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">—</option>
              {AUTHORS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-amber-900">Ingredients</h2>
          <span className="text-xs text-amber-500/70">Type to search USDA foods · enter grams for nutrition</span>
        </div>

        <div className="hidden sm:flex gap-2 text-xs font-medium text-amber-700/50 pb-0.5">
          <span className="w-20">Amount</span>
          <span className="w-20">Unit</span>
          <span className="flex-1">Ingredient</span>
          <span className="w-16 text-center">Grams</span>
          <span className="w-5" />
        </div>

        {ingredients.map((ing, i) => (
          <div key={i} className="space-y-1">
            <div className="flex gap-2 items-center">
              <input
                name="ingredientAmount"
                value={ing.amount}
                onChange={(e) => patch(i, { amount: e.target.value })}
                placeholder="2"
                className="w-20 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                name="ingredientUnit"
                value={ing.unit}
                onChange={(e) => patch(i, { unit: e.target.value })}
                placeholder="cups"
                className="w-20 rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="relative flex-1">
                <input
                  name="ingredientName"
                  value={ing.name}
                  onChange={(e) => handleNameInput(i, e.target.value)}
                  onBlur={() => setTimeout(() => patch(i, { _open: false }), 150)}
                  onFocus={() => ing._results.length > 0 && patch(i, { _open: true })}
                  placeholder="Search ingredient…"
                  autoComplete="off"
                  className="w-full rounded-lg border border-amber-200 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {ing._loading && (
                  <span className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-amber-600" />
                )}
                {ing.fdcId && !ing._loading && (
                  <span className="absolute right-2.5 top-2 text-green-600 text-sm" title="Linked to USDA">✓</span>
                )}
                {ing._open && ing._results.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-lg border border-amber-200 bg-white shadow-lg">
                    {ing._results.map((food) => (
                      <li key={food.fdcId}>
                        <button
                          type="button"
                          onMouseDown={() => selectFood(i, food)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 flex items-baseline justify-between gap-3"
                        >
                          <span className="text-amber-900 truncate">{food.name}</span>
                          <span className="text-xs text-amber-400 shrink-0">{food.calories} kcal/100g</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input
                name="ingredientGrams"
                type="number"
                min="0"
                step="1"
                value={ing.grams ?? ""}
                onChange={(e) => patch(i, { grams: parseFloat(e.target.value) || undefined })}
                placeholder="g"
                className="w-16 rounded-lg border border-amber-200 px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {/* Hidden nutrition fields */}
              <input type="hidden" name="ingredientFdcId" value={ing.fdcId ?? ""} />
              <input type="hidden" name="ingredientCalories" value={ing.calories ?? ""} />
              <input type="hidden" name="ingredientProtein" value={ing.protein ?? ""} />
              <input type="hidden" name="ingredientFat" value={ing.fat ?? ""} />
              <input type="hidden" name="ingredientSaturatedFat" value={ing.saturatedFat ?? ""} />
              <input type="hidden" name="ingredientCarbs" value={ing.carbs ?? ""} />
              <input type="hidden" name="ingredientSugar" value={ing.sugar ?? ""} />
              <input type="hidden" name="ingredientFiber" value={ing.fiber ?? ""} />
              <input type="hidden" name="ingredientCholesterol" value={ing.cholesterol ?? ""} />
              <input type="hidden" name="ingredientSodium" value={ing.sodium ?? ""} />
              <input type="hidden" name="ingredientPotassium" value={ing.potassium ?? ""} />
              <input type="hidden" name="ingredientCalcium" value={ing.calcium ?? ""} />
              <input type="hidden" name="ingredientIron" value={ing.iron ?? ""} />
              <input type="hidden" name="ingredientVitaminC" value={ing.vitaminC ?? ""} />
              <input type="hidden" name="ingredientVitaminD" value={ing.vitaminD ?? ""} />
              <input type="hidden" name="ingredientVitaminA" value={ing.vitaminA ?? ""} />
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
            {ing.fdcId && (
              <div className="pl-44 flex flex-wrap items-center gap-x-4 gap-y-1">
                {ing._portionsLoading ? (
                  <span className="text-xs text-amber-400">Loading portions…</span>
                ) : ing._portions.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-amber-600/80">Portion:</span>
                    <select
                      value={ing._portions.find((p) => p.grams === ing.grams) ? String(ing.grams) : ""}
                      onChange={(e) => {
                        if (e.target.value) patch(i, { grams: Number(e.target.value) })
                      }}
                      className="text-xs rounded border border-amber-200 px-1.5 py-0.5 bg-white text-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="">— pick a portion —</option>
                      {ing._portions.map((p) => (
                        <option key={p.description} value={String(p.grams)}>
                          {p.description} ({p.grams}g)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                {ing.calories !== undefined && (
                  <span className="text-xs text-amber-500/60">
                    per 100g: {ing.calories} kcal · {ing.protein}g protein · {ing.fat}g fat{ing.saturatedFat ? ` (${ing.saturatedFat}g sat)` : ""} · {ing.carbs}g carbs{ing.fiber ? ` · ${ing.fiber}g fiber` : ""}{ing.sodium ? ` · ${ing.sodium}mg sodium` : ""}
                  </span>
                )}
              </div>
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

      {/* Notes */}
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-amber-900">Notes</h2>
        <NotesEditor initialContent={initialData?.notes} onChange={setNotes} />
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-amber-600 px-8 py-3 font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}
