"use client"

import { useState, useEffect, useRef } from "react"
import type { Ingredient } from "@/app/actions"

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

type NutritionRow = Ingredient & {
  searchQuery: string
  results: FoodResult[]
  searching: boolean
  showResults: boolean
  portions: FoodPortion[]
  portionsLoading: boolean
}

type Props = {
  ingredients: Ingredient[]
  onSave: (updated: Ingredient[]) => void
  onClose: () => void
}

export default function NutritionModal({ ingredients, onSave, onClose }: Props) {
  const [rows, setRows] = useState<NutritionRow[]>(() =>
    ingredients.map((ing) => ({
      ...ing,
      searchQuery: ing.name,
      results: [],
      searching: false,
      showResults: false,
      portions: [],
      portionsLoading: false,
    }))
  )

  const searchTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  function setRow(index: number, updates: Partial<NutritionRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates } : r)))
  }

  async function searchFood(index: number, query: string, showOnComplete = true) {
    if (query.trim().length < 2) {
      setRow(index, { results: [], searching: false, showResults: false })
      return
    }
    setRow(index, { searching: true })
    try {
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query.trim())}`)
      const results: FoodResult[] = await res.json()
      setRow(index, { results, searching: false, showResults: showOnComplete && results.length > 0 })
    } catch {
      setRow(index, { searching: false })
    }
  }

  async function loadPortions(index: number, fdcId: number) {
    setRow(index, { portionsLoading: true })
    try {
      const res = await fetch(`/api/foods/${fdcId}`)
      const data = await res.json()
      setRow(index, { portions: data.portions ?? [], portionsLoading: false })
    } catch {
      setRow(index, { portionsLoading: false })
    }
  }

  // On open: auto-search unlinked ingredients; reload portions for already-linked ones
  useEffect(() => {
    ingredients.forEach((ing, i) => {
      if (ing.fdcId) {
        loadPortions(i, ing.fdcId)
      } else if (ing.name.trim().length >= 2) {
        searchFood(i, ing.name, false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearchInput(index: number, value: string) {
    setRow(index, { searchQuery: value, showResults: false })
    const existing = searchTimers.current.get(index)
    if (existing) clearTimeout(existing)
    const timer = setTimeout(() => {
      searchFood(index, value)
      searchTimers.current.delete(index)
    }, 400)
    searchTimers.current.set(index, timer)
  }

  async function selectFood(index: number, food: FoodResult) {
    setRow(index, {
      fdcId: food.fdcId,
      searchQuery: food.name,
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
      results: [],
      showResults: false,
      searching: false,
      portions: [],
      portionsLoading: true,
    })
    try {
      const res = await fetch(`/api/foods/${food.fdcId}`)
      const data = await res.json()
      setRow(index, { portions: data.portions ?? [], portionsLoading: false })
    } catch {
      setRow(index, { portionsLoading: false })
    }
  }

  function clearNutrition(index: number) {
    setRow(index, {
      fdcId: undefined,
      grams: undefined,
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
      portions: [],
      searchQuery: ingredients[index]?.name ?? "",
      results: [],
      showResults: false,
    })
  }

  function handleSave() {
    onSave(
      rows.map((row) => {
        const ing: Ingredient = { amount: row.amount, unit: row.unit, name: row.name }
        if (row.fdcId !== undefined) ing.fdcId = row.fdcId
        if (row.grams !== undefined) ing.grams = row.grams
        if (row.calories !== undefined) ing.calories = row.calories
        if (row.protein !== undefined) ing.protein = row.protein
        if (row.fat !== undefined) ing.fat = row.fat
        if (row.saturatedFat !== undefined) ing.saturatedFat = row.saturatedFat
        if (row.carbs !== undefined) ing.carbs = row.carbs
        if (row.sugar !== undefined) ing.sugar = row.sugar
        if (row.fiber !== undefined) ing.fiber = row.fiber
        if (row.cholesterol !== undefined) ing.cholesterol = row.cholesterol
        if (row.sodium !== undefined) ing.sodium = row.sodium
        if (row.potassium !== undefined) ing.potassium = row.potassium
        if (row.calcium !== undefined) ing.calcium = row.calcium
        if (row.iron !== undefined) ing.iron = row.iron
        if (row.vitaminC !== undefined) ing.vitaminC = row.vitaminC
        if (row.vitaminD !== undefined) ing.vitaminD = row.vitaminD
        if (row.vitaminA !== undefined) ing.vitaminA = row.vitaminA
        return ing
      })
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-6 sm:pt-12 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-yellow-100 px-4 sm:px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-yellow-900">Nutrition Lookup</h2>
            <p className="text-xs text-yellow-500/70 mt-0.5">
              Match each ingredient to a USDA food and set the gram weight
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-yellow-400 hover:text-yellow-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="divide-y divide-yellow-50 px-4 sm:px-6">
          {rows.map((row, i) => (
            <div key={i} className="py-4 space-y-2">
              <p className="text-sm font-medium text-yellow-900">
                {[row.amount, row.unit, row.name].filter(Boolean).join(" ")}
              </p>

              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    value={row.searchQuery}
                    onChange={(e) => handleSearchInput(i, e.target.value)}
                    onBlur={() => setTimeout(() => setRow(i, { showResults: false }), 150)}
                    onFocus={() => row.results.length > 0 && setRow(i, { showResults: true })}
                    placeholder="Search USDA foods…"
                    autoComplete="off"
                    className="w-full rounded-lg border border-yellow-200 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  {row.searching && (
                    <span className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-yellow-300 border-t-yellow-600" />
                  )}
                  {row.fdcId && !row.searching && (
                    <span className="absolute right-2.5 top-2 text-green-500 text-sm" title="Linked to USDA">✓</span>
                  )}
                  {row.showResults && row.results.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-lg border border-yellow-200 bg-white shadow-lg">
                      {row.results.map((food) => (
                        <li key={food.fdcId}>
                          <button
                            type="button"
                            onMouseDown={() => selectFood(i, food)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-50 flex items-baseline justify-between gap-3"
                          >
                            <span className="text-yellow-900 truncate">{food.name}</span>
                            <span className="text-xs text-yellow-400 shrink-0">{food.calories} kcal/100g</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={row.grams ?? ""}
                    onChange={(e) => setRow(i, { grams: parseFloat(e.target.value) || undefined })}
                    placeholder="g"
                    className="w-20 rounded-lg border border-yellow-200 px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <span className="text-xs text-yellow-400">g</span>
                </div>
              </div>

              {row.fdcId && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {row.portionsLoading ? (
                    <span className="text-xs text-yellow-400">Loading portions…</span>
                  ) : row.portions.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-yellow-600/70">Portion:</span>
                      <select
                        value={row.portions.find((p) => p.grams === row.grams) ? String(row.grams) : ""}
                        onChange={(e) => {
                          if (e.target.value) setRow(i, { grams: Number(e.target.value) })
                        }}
                        className="text-xs rounded border border-yellow-200 px-1.5 py-0.5 bg-white text-yellow-800 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      >
                        <option value="">— pick portion —</option>
                        {row.portions.map((p) => (
                          <option key={p.description} value={String(p.grams)}>
                            {p.description} ({p.grams}g)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {row.calories !== undefined && (
                    <span className="text-xs text-yellow-500/60">
                      {row.calories} kcal · {row.protein}g protein · {row.fat}g fat · {row.carbs}g carbs per 100g
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => clearNutrition(i)}
                    className="text-xs text-red-400 hover:text-red-600 ml-auto"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-yellow-100 px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-yellow-600 hover:text-yellow-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-yellow-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-yellow-700 transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  )
}
