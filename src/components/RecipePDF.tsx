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

  async function toJpegDataUrl(src: string): Promise<string | null> {
    try {
      const res = await fetch(src)
      const srcBlob = await res.blob()
      const blobUrl = URL.createObjectURL(srcBlob)
      return await new Promise((resolve) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          canvas.getContext("2d")!.drawImage(img, 0, 0)
          URL.revokeObjectURL(blobUrl)
          resolve(canvas.toDataURL("image/jpeg", 0.92))
        }
        img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null) }
        img.src = blobUrl
      })
    } catch {
      return null
    }
  }

  async function handleDownload() {
    setLoading(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const { RecipePDFDocument } = await import("./RecipePDFDocument")
      const imageUrl = recipe.imageUrl ? await toJpegDataUrl(recipe.imageUrl) : null
      const blob = await pdf(<RecipePDFDocument recipe={{ ...recipe, imageUrl }} />).toBlob()
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
