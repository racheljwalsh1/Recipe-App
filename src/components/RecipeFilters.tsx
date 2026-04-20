"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useRef, useState, useEffect, useTransition } from "react"

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Drink"]

interface RecipeFiltersProps {
  authors: string[]
  totalCount: number
  filteredCount: number
}

export default function RecipeFilters({ authors, totalCount, filteredCount }: RecipeFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const spRef = useRef(searchParams)
  spRef.current = searchParams

  const currentQ = searchParams.get("q") ?? ""
  const currentIngredientParam = searchParams.get("ingredient") ?? ""
  const currentIngredients = currentIngredientParam ? currentIngredientParam.split(",").filter(Boolean) : []
  const currentCategory = searchParams.get("category") ?? ""
  const currentAuthor = searchParams.get("author") ?? ""
  const currentHp = searchParams.get("hp") === "1"
  const currentLc = searchParams.get("lc") === "1"
  const currentRatingBy = searchParams.get("ratingBy") ?? ""
  const currentMinRating = searchParams.get("minRating") ?? ""

  const [qInput, setQInput] = useState(currentQ)
  const [ingredientTags, setIngredientTags] = useState<string[]>(currentIngredients)
  const [ingredientText, setIngredientText] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Sync text inputs when URL changes externally (back/forward)
  useEffect(() => { setQInput(currentQ) }, [currentQ])
  useEffect(() => {
    setIngredientTags(currentIngredientParam ? currentIngredientParam.split(",").filter(Boolean) : [])
  }, [currentIngredientParam])

  function navigate(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      v ? next.set(k, v) : next.delete(k)
    }
    const qs = next.toString()
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`))
  }

  useEffect(() => {
    const t = setTimeout(() => {
      const prev = spRef.current.get("q") ?? ""
      if (qInput === prev) return
      const next = new URLSearchParams(spRef.current.toString())
      qInput ? next.set("q", qInput) : next.delete("q")
      startTransition(() => router.replace(`${pathname}?${next}`))
    }, 300)
    return () => clearTimeout(t)
  }, [qInput])

  function addIngredient(val: string) {
    const trimmed = val.trim().toLowerCase()
    if (!trimmed || ingredientTags.includes(trimmed)) {
      setIngredientText("")
      return
    }
    const next = [...ingredientTags, trimmed]
    setIngredientTags(next)
    setIngredientText("")
    navigate({ ingredient: next.join(",") })
  }

  function removeIngredient(tag: string) {
    const next = ingredientTags.filter((t) => t !== tag)
    setIngredientTags(next)
    navigate({ ingredient: next.length ? next.join(",") : null })
  }

  function handleIngredientKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addIngredient(ingredientText)
    } else if (e.key === "Backspace" && !ingredientText && ingredientTags.length > 0) {
      removeIngredient(ingredientTags[ingredientTags.length - 1])
    }
  }

  const hasFilters =
    currentQ || currentIngredients.length > 0 || currentCategory || currentAuthor ||
    currentHp || currentLc || currentMinRating

  const activeSecondaryCount = [currentCategory, currentAuthor, currentRatingBy, currentHp, currentLc].filter(Boolean).length

  function clearAll() {
    setQInput("")
    setIngredientTags([])
    setIngredientText("")
    navigate({ q: null, ingredient: null, category: null, author: null, hp: null, lc: null, ratingBy: null, minRating: null })
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search recipes…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            className="w-full rounded-xl border border-amber-200 bg-white py-2.5 pl-9 pr-4 text-sm text-amber-900 placeholder:text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100">
          <span className="shrink-0 text-amber-300 text-base leading-none">🥕</span>
          {ingredientTags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {tag}
              <button type="button" onClick={() => removeIngredient(tag)} className="text-amber-500 hover:text-amber-800 leading-none">&times;</button>
            </span>
          ))}
          <input
            type="text"
            placeholder={ingredientTags.length === 0 ? "Find by ingredient…" : "Add another…"}
            value={ingredientText}
            onChange={(e) => setIngredientText(e.target.value)}
            onKeyDown={handleIngredientKeyDown}
            onBlur={() => { if (ingredientText.trim()) addIngredient(ingredientText) }}
            className="min-w-[100px] flex-1 bg-transparent text-amber-900 placeholder:text-amber-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 hover:bg-amber-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
          Filters
          {activeSecondaryCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {activeSecondaryCount}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className={`flex-wrap items-center gap-2 ${filtersOpen ? "flex" : "hidden"} sm:flex`}>
        <select
          value={currentCategory}
          onChange={(e) => navigate({ category: e.target.value || null })}
          className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {authors.length > 0 && (
          <select
            value={currentAuthor}
            onChange={(e) => navigate({ author: e.target.value || null })}
            className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            <option value="">All authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1">
          <select
            value={currentRatingBy}
            onChange={(e) => {
              const val = e.target.value
              navigate({ ratingBy: val || null, minRating: val ? (currentMinRating || "3") : null })
            }}
            className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            <option value="">Any rating</option>
            <option value="rhys">Rhys ★</option>
            <option value="rachel">Rachel ★</option>
          </select>
          {currentRatingBy && (
            <select
              value={currentMinRating}
              onChange={(e) => navigate({ minRating: e.target.value || null })}
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            >
              <option value="1">★+</option>
              <option value="2">★★+</option>
              <option value="3">★★★+</option>
              <option value="4">★★★★+</option>
              <option value="5">★★★★★</option>
            </select>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 hover:bg-amber-50 transition-colors">
          <input
            type="checkbox"
            checked={currentHp}
            onChange={(e) => navigate({ hp: e.target.checked ? "1" : null })}
            className="accent-blue-500"
          />
          High Protein
        </label>

        <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-800 hover:bg-amber-50 transition-colors">
          <input
            type="checkbox"
            checked={currentLc}
            onChange={(e) => navigate({ lc: e.target.checked ? "1" : null })}
            className="accent-green-500"
          />
          Low Calorie
        </label>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="hidden sm:block rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-100 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-amber-600/80">
          {filteredCount === totalCount
            ? `${totalCount} recipe${totalCount !== 1 ? "s" : ""}`
            : `${filteredCount} of ${totalCount} recipes match`}
        </p>
      )}
    </div>
  )
}
