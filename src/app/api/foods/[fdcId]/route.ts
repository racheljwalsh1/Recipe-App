import type { NextRequest } from "next/server"

type RawPortion = {
  gramWeight?: number
  portionDescription?: string
  amount?: number
  modifier?: string
}

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/foods/[fdcId]">) {
  const { fdcId } = await ctx.params

  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${process.env.USDA_API_KEY}`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return Response.json({ portions: [] })

  const data = await res.json()

  const portions = (data.foodPortions ?? [])
    .filter((p: RawPortion) => p.gramWeight && p.gramWeight > 0)
    .map((p: RawPortion) => {
      const description =
        p.portionDescription ??
        (p.amount != null && p.modifier ? `${p.amount} ${p.modifier}` : null)
      return description ? { description, grams: Math.round(p.gramWeight!) } : null
    })
    .filter(Boolean)

  return Response.json({ portions })
}
