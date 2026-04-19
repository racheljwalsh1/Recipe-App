"use client"

import { useState, useTransition } from "react"
import { createRecipe } from "@/app/actions"
import type { Ingredient } from "@/app/actions"
import NotesEditor from "@/components/NotesEditor"
import NutritionModal from "@/components/NutritionModal"

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink", "Other"]
const AUTHORS = ["Rachel", "Rhys"]

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
  rhysRating: number | null
  rachelRating: number | null
}

type Props = {
  action?: (formData: FormData) => Promise<void>
  initialData?: InitialData
  submitLabel?: string
}

type ParsedRecipe = {
  title: string
  description: string
  servings: number
  prepTime: number
  cookTime: number
  category: string
  ingredients: { amount: string; unit: string; name: string }[]
  instructions: string[]
}

export default function RecipeForm({ action = createRecipe, initialData, submitLabel = "Save Recipe" }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [servings, setServings] = useState(initialData?.servings ?? 4)
  const [prepTime, setPrepTime] = useState(initialData?.prepTime ?? 0)
  const [cookTime, setCookTime] = useState(initialData?.cookTime ?? 0)
  const [category, setCategory] = useState(initialData?.category ?? "")
  const [author, setAuthor] = useState(initialData?.author ?? "")
  const [rhysRating, setRhysRating] = useState<number>(initialData?.rhysRating ?? 0)
  const [rachelRating, setRachelRating] = useState<number>(initialData?.rachelRating ?? 0)

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients.length
      ? initialData.ingredients
      : [{ amount: "", unit: "", name: "" }]
  )
  const [instructions, setInstructions] = useState<string[]>(
    initialData?.instructions.length ? initialData.instructions : [""]
  )
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialData?.imageUrl ?? null)
  const [notes, setNotes] = useState<string>(initialData?.notes ?? "")
  const [isPending, startTransition] = useTransition()

  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parseSuccess, setParseSuccess] = useState(false)

  const [showNutritionModal, setShowNutritionModal] = useState(false)

  const displayImage = imagePreview ?? existingImageUrl

  function patch(index: number, updates: Partial<Ingredient>) {
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
    setIngredients((prev) => [...prev, { amount: "", unit: "", name: "" }])
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index))
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

  async function parseAndPopulate() {
    if (!importText.trim()) return
    setIsParsing(true)
    setParseError(null)
    setParseSuccess(false)
    try {
      const res = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText }),
      })
      if (!res.ok) throw new Error("Parse failed")
      const data: ParsedRecipe = await res.json()

      if (data.title) setTitle(data.title)
      if (data.description) setDescription(data.description)
      if (data.servings) setServings(data.servings)
      if (data.prepTime !== undefined) setPrepTime(data.prepTime)
      if (data.cookTime !== undefined) setCookTime(data.cookTime)
      if (data.category && CATEGORIES.includes(data.category)) setCategory(data.category)
      if (data.ingredients?.length) {
        setIngredients(data.ingredients.map((ing) => ({ amount: ing.amount, unit: ing.unit, name: ing.name })))
      }
      if (data.instructions?.length) {
        setInstructions(data.instructions.filter(Boolean))
      }

      setParseSuccess(true)
      setShowImport(false)
      setImportText("")
    } catch {
      setParseError("Couldn't parse the recipe. Try again or paste in a different format.")
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <>
      {showNutritionModal && (
        <NutritionModal
          ingredients={ingredients}
          onSave={(updated) => {
            setIngredients(updated)
            setShowNutritionModal(false)
          }}
          onClose={() => setShowNutritionModal(false)}
        />
      )}

      <form
        action={(formData) => startTransition(async () => { await action(formData) })}
        className="space-y-8"
      >
        <input type="hidden" name="existingImageUrl" value={existingImageUrl ?? ""} />
        <input type="hidden" name="notes" value={notes} />
        <input type="hidden" name="rhysRating" value={rhysRating} />
        <input type="hidden" name="rachelRating" value={rachelRating} />

        {/* Import from text */}
        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
          <button
            type="button"
            onClick={() => { setShowImport((v) => !v); setParseError(null) }}
            className="flex items-center gap-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
          >
            <span className="text-base">✨</span>
            Import from text
            <span className="ml-1 text-yellow-500/70 text-xs">{showImport ? "▲" : "▼"}</span>
          </button>

          {parseSuccess && !showImport && (
            <p className="mt-2 text-xs text-green-700">Recipe imported — review and adjust the fields below.</p>
          )}

          {showImport && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-yellow-700/80">
                Paste a recipe in any format — copied from a website, typed out, or handwritten notes. Claude will extract the fields for you.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                placeholder="Paste your recipe text here…"
                className="w-full rounded-lg border border-yellow-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
              />
              {parseError && <p className="text-xs text-red-600">{parseError}</p>}
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={parseAndPopulate}
                  disabled={isParsing || !importText.trim()}
                  className="rounded-full bg-yellow-600 px-5 py-2 text-sm font-medium text-white hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {isParsing ? "Parsing…" : "Parse Recipe"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowImport(false); setParseError(null) }}
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Basic info */}
        <section className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-yellow-900">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-yellow-800 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Classic Banana Bread"
              className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-800 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description..."
              className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-800 mb-1">Photo</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-yellow-800 file:mr-3 file:rounded-full file:border-0 file:bg-yellow-100 file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-yellow-700 hover:file:bg-yellow-200"
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
              <label className="block text-sm font-medium text-yellow-800 mb-1">Servings</label>
              <input
                name="servings"
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">Prep (min)</label>
              <input
                name="prepTime"
                type="number"
                min={0}
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">Cook (min)</label>
              <input
                name="cookTime"
                type="number"
                min={0}
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">Category</label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">Written by</label>
              <input
                list="authors-list"
                name="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Select or type a name…"
                className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              />
              <datalist id="authors-list">
                {AUTHORS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
          </div>
        </section>

        {/* Ratings */}
        <section className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-yellow-900">Ratings</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-2">Rhys&apos;s Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRhysRating(rhysRating === n ? 0 : n)}
                    className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                  >
                    {n <= rhysRating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              {rhysRating > 0 && (
                <button
                  type="button"
                  onClick={() => setRhysRating(0)}
                  className="mt-1 text-xs text-yellow-400 hover:text-yellow-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-2">Rachel&apos;s Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRachelRating(rachelRating === n ? 0 : n)}
                    className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${n} popcorn${n !== 1 ? "s" : ""}`}
                  >
                    {n <= rachelRating ? "🍿" : "○"}
                  </button>
                ))}
              </div>
              {rachelRating > 0 && (
                <button
                  type="button"
                  onClick={() => setRachelRating(0)}
                  className="mt-1 text-xs text-yellow-400 hover:text-yellow-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-yellow-900">Ingredients</h2>

          <div className="hidden sm:flex gap-2 text-xs font-medium text-yellow-700/50 pb-0.5">
            <span className="w-20">Amount</span>
            <span className="w-20">Unit</span>
            <span className="flex-1">Ingredient</span>
            <span className="w-5" />
          </div>

          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                name="ingredientAmount"
                value={ing.amount}
                onChange={(e) => patch(i, { amount: e.target.value })}
                placeholder="½"
                className="w-20 rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                name="ingredientUnit"
                value={ing.unit}
                onChange={(e) => patch(i, { unit: e.target.value })}
                placeholder="cups"
                className="w-20 rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <div className="relative flex-1">
                <input
                  name="ingredientName"
                  value={ing.name}
                  onChange={(e) => patch(i, { name: e.target.value })}
                  placeholder="e.g. small onion, finely diced"
                  className="w-full rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {ing.fdcId && (
                  <span
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-green-400"
                    title="Nutrition linked"
                  />
                )}
              </div>
              {/* Hidden nutrition fields — populated via Get Nutrition modal */}
              <input type="hidden" name="ingredientGrams" value={ing.grams ?? ""} />
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
          ))}

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={addIngredient}
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
            >
              + Add ingredient
            </button>
            {(() => {
              const needsNutrition = ingredients.some((ing) => ing.name.trim() && !ing.fdcId)
              return (
                <button
                  type="button"
                  onClick={() => setShowNutritionModal(true)}
                  className={
                    needsNutrition
                      ? "text-sm font-medium rounded-full px-4 py-1.5 transition-colors text-white bg-gradient-to-r from-yellow-500 to-violet-500 hover:from-yellow-600 hover:to-violet-600 shadow-md shadow-yellow-200"
                      : "text-sm text-yellow-700 font-medium border border-yellow-200 rounded-full px-4 py-1.5 hover:bg-yellow-50 transition-colors"
                  }
                >
                  {needsNutrition ? "✨ Get Nutrition" : "Get Nutrition"}
                </button>
              )
            })()}
          </div>
        </section>

        {/* Instructions */}
        <section className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-yellow-900">Instructions</h2>

          {instructions.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2 shrink-0 w-7 h-7 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <textarea
                name="instruction"
                value={step}
                onChange={(e) => updateInstruction(i, e.target.value)}
                rows={2}
                placeholder={`Step ${i + 1}`}
                className="flex-1 rounded-lg border border-yellow-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
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
            className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
          >
            + Add step
          </button>
        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-yellow-900">Notes</h2>
          <NotesEditor initialContent={initialData?.notes} onChange={setNotes} />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-yellow-600 px-8 py-3 font-medium text-white hover:bg-yellow-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </>
  )
}
