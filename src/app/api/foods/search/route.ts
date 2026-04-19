import { NextRequest } from "next/server"

type UsdaFood = {
  fdcId: number
  description: string
  foodNutrients: Array<{ nutrientId: number; value: number }>
}

function getNutrient(nutrients: UsdaFood["foodNutrients"], id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0
}

function r1(n: number) { return Math.round(n * 10) / 10 }

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) return Response.json([])

  const url =
    `https://api.nal.usda.gov/fdc/v1/foods/search` +
    `?query=${encodeURIComponent(q)}` +
    `&api_key=${process.env.USDA_API_KEY}` +
    `&pageSize=8` +
    `&dataType=Foundation,SR%20Legacy`

  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return Response.json([])

  const data = await res.json()
  const results = (data.foods ?? []).map((food: UsdaFood) => {
    const n = food.foodNutrients
    return {
      fdcId: food.fdcId,
      name: food.description,
      // macros (per 100g)
      calories:     Math.round(getNutrient(n, 1008)),
      protein:      r1(getNutrient(n, 1003)),
      fat:          r1(getNutrient(n, 1004)),
      saturatedFat: r1(getNutrient(n, 1258)),
      carbs:        r1(getNutrient(n, 1005)),
      sugar:        r1(getNutrient(n, 1063)),
      fiber:        r1(getNutrient(n, 1079)),
      // minerals (mg per 100g)
      cholesterol:  r1(getNutrient(n, 1253)),
      sodium:       r1(getNutrient(n, 1093)),
      potassium:    r1(getNutrient(n, 1092)),
      calcium:      r1(getNutrient(n, 1087)),
      iron:         r1(getNutrient(n, 1089)),
      // vitamins
      vitaminC:     r1(getNutrient(n, 1162)),
      vitaminD:     r1(getNutrient(n, 1114)),
      vitaminA:     r1(getNutrient(n, 1106)),
    }
  })

  return Response.json(results)
}
