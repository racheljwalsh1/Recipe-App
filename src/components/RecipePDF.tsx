"use client"

import { useState } from "react"

type Ingredient = { amount: string; unit: string; name: string }

type Recipe = {
  title: string
  description: string | null
  servings: number
  prepTime: number
  cookTime: number
  category: string | null
  imageUrl: string | null
  ingredients: Ingredient[]
  instructions: string[]
  notes: string | null
  tags: string[]
}

export default function RecipePDFButton({ recipe }: { recipe: Recipe }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const { RecipePDFDocument } = await import("./RecipePDFDocument")
      const blob = await pdf(<RecipePDFDocument recipe={recipe} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${recipe.title.replace(/\s+/g, "-").toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="rounded-full border border-amber-300 bg-white px-5 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-60"
    >
      {loading ? "Generating PDF…" : "⬇ Download PDF"}
    </button>
  )
}
