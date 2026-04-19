import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import RecipePDFButton from "@/components/RecipePDF"
import DeleteRecipeButton from "@/components/DeleteRecipeButton"
import type { Ingredient } from "@/app/actions"

export default async function RecipePage(props: PageProps<"/recipes/[id]">) {
  const { id } = await props.params
  const recipe = await prisma.recipe.findUnique({ where: { id } })
  if (!recipe) notFound()

  const ingredients: Ingredient[] = JSON.parse(recipe.ingredients)
  const instructions: string[] = JSON.parse(recipe.instructions)
  const totalTime = recipe.prepTime + recipe.cookTime

  const trackedIngredients = ingredients.filter(
    (ing) => typeof ing.grams === "number" && ing.grams > 0 && typeof ing.calories === "number"
  )
  const nutritionTotals = trackedIngredients.reduce(
    (acc, ing) => {
      const f = (ing.grams as number) / 100
      return {
        calories:     acc.calories     + (ing.calories     ?? 0) * f,
        protein:      acc.protein      + (ing.protein      ?? 0) * f,
        fat:          acc.fat          + (ing.fat          ?? 0) * f,
        saturatedFat: acc.saturatedFat + (ing.saturatedFat ?? 0) * f,
        carbs:        acc.carbs        + (ing.carbs        ?? 0) * f,
        sugar:        acc.sugar        + (ing.sugar        ?? 0) * f,
        fiber:        acc.fiber        + (ing.fiber        ?? 0) * f,
        cholesterol:  acc.cholesterol  + (ing.cholesterol  ?? 0) * f,
        sodium:       acc.sodium       + (ing.sodium       ?? 0) * f,
        potassium:    acc.potassium    + (ing.potassium    ?? 0) * f,
        calcium:      acc.calcium      + (ing.calcium      ?? 0) * f,
        iron:         acc.iron         + (ing.iron         ?? 0) * f,
        vitaminC:     acc.vitaminC     + (ing.vitaminC     ?? 0) * f,
        vitaminD:     acc.vitaminD     + (ing.vitaminD     ?? 0) * f,
        vitaminA:     acc.vitaminA     + (ing.vitaminA     ?? 0) * f,
      }
    },
    { calories: 0, protein: 0, fat: 0, saturatedFat: 0, carbs: 0, sugar: 0, fiber: 0,
      cholesterol: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0,
      vitaminC: 0, vitaminD: 0, vitaminA: 0 }
  )

  const servings = recipe.servings
  function ps(val: number, decimals = 1) {
    return Math.round((val / servings) * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }

  const perServing = {
    calories:     Math.round(nutritionTotals.calories / servings),
    protein:      ps(nutritionTotals.protein),
    fat:          ps(nutritionTotals.fat),
    saturatedFat: ps(nutritionTotals.saturatedFat),
    carbs:        ps(nutritionTotals.carbs),
    sugar:        ps(nutritionTotals.sugar),
    fiber:        ps(nutritionTotals.fiber),
    cholesterol:  ps(nutritionTotals.cholesterol),
    sodium:       ps(nutritionTotals.sodium),
    potassium:    ps(nutritionTotals.potassium),
    calcium:      ps(nutritionTotals.calcium),
    iron:         ps(nutritionTotals.iron),
    vitaminC:     ps(nutritionTotals.vitaminC),
    vitaminD:     ps(nutritionTotals.vitaminD),
    vitaminA:     ps(nutritionTotals.vitaminA),
  }

  const hasSugar = trackedIngredients.some((ing) => ing.sugar)
  const hasSaturatedFat = trackedIngredients.some((ing) => ing.saturatedFat)

  function dv(val: number, ref: number) {
    return Math.round((val / ref) * 100)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-amber-600 hover:text-amber-800">
            ← All Recipes
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-amber-900">{recipe.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {recipe.category && (
              <span className="inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
                {recipe.category}
              </span>
            )}
            {recipe.author && (
              <span className="text-xs text-amber-700/70">Made by {recipe.author}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="rounded-full border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
          >
            Edit
          </Link>
          <RecipePDFButton
            recipe={{
              title: recipe.title,
              description: recipe.description,
              servings: recipe.servings,
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              category: recipe.category,
              imageUrl: recipe.imageUrl,
              ingredients,
              instructions,
            }}
          />
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      {recipe.imageUrl && (
        <div className="relative mb-8 h-72 w-full overflow-hidden rounded-2xl">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {recipe.description && (
        <p className="mb-6 text-amber-800/70 leading-relaxed">{recipe.description}</p>
      )}

      <div className="mb-8 space-y-3">
        {/* Key stat cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-amber-200 bg-white px-4 py-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-amber-900">{recipe.servings}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-400">Servings</div>
          </div>
          {perServing.calories > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-white px-4 py-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-amber-900">{perServing.calories}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-400">Cal / Serving</div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-4 py-4 text-center">
              <div className="text-sm text-amber-300">—</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-300">Cal / Serving</div>
            </div>
          )}
          {perServing.protein > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-white px-4 py-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-amber-900">{perServing.protein}<span className="text-lg font-normal text-amber-400">g</span></div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-400">Protein / Serving</div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-4 py-4 text-center">
              <div className="text-sm text-amber-300">—</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-300">Protein / Serving</div>
            </div>
          )}
        </div>
        {/* Time info */}
        {totalTime > 0 && (
          <div className="flex gap-6 rounded-2xl bg-amber-50 px-6 py-3 text-sm text-amber-800">
            {recipe.prepTime > 0 && (
              <div><span className="font-semibold">Prep</span> {recipe.prepTime} min</div>
            )}
            {recipe.cookTime > 0 && (
              <div><span className="font-semibold">Cook</span> {recipe.cookTime} min</div>
            )}
            <div><span className="font-semibold">Total</span> {totalTime} min</div>
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-amber-900">Ingredients</h2>
          <ul className="space-y-2 rounded-2xl border border-amber-100 bg-white p-5">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-24 shrink-0 font-medium text-amber-700">
                  {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                </span>
                <span className="text-amber-900">{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {instructions.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-amber-900">Instructions</h2>
          <ol className="space-y-4">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-amber-900">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.notes && (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-amber-900">Notes</h2>
          <div
            className="rounded-2xl border border-amber-100 bg-white px-6 py-5 text-sm text-amber-900 leading-relaxed
              [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-amber-900 [&_h2]:mt-3 [&_h2]:mb-1
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-amber-900 [&_h3]:mt-2 [&_h3]:mb-1
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
              [&_li]:my-0.5
              [&_p]:my-1
              [&_strong]:font-semibold
              [&_em]:italic
              [&_s]:line-through
              [&_blockquote]:border-l-4 [&_blockquote]:border-amber-300 [&_blockquote]:pl-3 [&_blockquote]:text-amber-700"
            dangerouslySetInnerHTML={{ __html: recipe.notes }}
          />
        </section>
      )}

      {trackedIngredients.length > 0 && (
        <section className="mb-8">
          <div className="border-2 border-amber-200 rounded-2xl bg-white p-4 text-amber-900 max-w-xs mx-auto shadow-sm">
            {/* Header */}
            <p className="text-4xl font-black leading-none tracking-tight text-amber-900">Nutrition Facts</p>
            <p className="mt-1.5 text-sm text-amber-700">{servings} serving{servings !== 1 ? "s" : ""} per recipe</p>
            <div className="mt-0.5 flex justify-between border-t border-amber-300 pt-0.5 text-sm font-bold text-amber-900">
              <span>Serving size</span>
              <span>1 serving</span>
            </div>

            {/* Calories */}
            <div className="border-t-[8px] border-amber-800 pt-1">
              <p className="text-xs font-medium text-amber-600">Amount per serving</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-amber-900">Calories</span>
                <span className="text-5xl font-black leading-none text-amber-900">{perServing.calories}</span>
              </div>
            </div>

            {/* Nutrient rows */}
            <div className="border-t-[4px] border-amber-700">
              <p className="py-0.5 text-right text-xs font-bold text-amber-600">% Daily Value*</p>

              <div className="flex justify-between border-t border-amber-100 py-[3px] text-sm">
                <span><b>Total Fat</b> {perServing.fat}g</span>
                <b>{dv(perServing.fat, 78)}%</b>
              </div>
              {hasSaturatedFat && (
                <div className="flex justify-between border-t border-amber-100 py-[3px] pl-4 text-sm text-amber-700">
                  <span>Saturated Fat {perServing.saturatedFat}g</span>
                  <b className="text-amber-900">{dv(perServing.saturatedFat, 20)}%</b>
                </div>
              )}
              {perServing.cholesterol > 0 && (
                <div className="flex justify-between border-t border-amber-100 py-[3px] text-sm">
                  <span><b>Cholesterol</b> {Math.round(perServing.cholesterol)}mg</span>
                  <b>{dv(perServing.cholesterol, 300)}%</b>
                </div>
              )}
              {perServing.sodium > 0 && (
                <div className="flex justify-between border-t border-amber-100 py-[3px] text-sm">
                  <span><b>Sodium</b> {Math.round(perServing.sodium)}mg</span>
                  <b>{dv(perServing.sodium, 2300)}%</b>
                </div>
              )}
              <div className="flex justify-between border-t border-amber-100 py-[3px] text-sm">
                <span><b>Total Carbohydrate</b> {perServing.carbs}g</span>
                <b>{dv(perServing.carbs, 275)}%</b>
              </div>
              {perServing.fiber > 0 && (
                <div className="flex justify-between border-t border-amber-100 py-[3px] pl-4 text-sm text-amber-700">
                  <span>Dietary Fiber {perServing.fiber}g</span>
                  <b className="text-amber-900">{dv(perServing.fiber, 28)}%</b>
                </div>
              )}
              {hasSugar && (
                <div className="flex justify-between border-t border-amber-100 py-[3px] pl-4 text-sm text-amber-700">
                  <span>Total Sugars {perServing.sugar}g</span>
                  <span />
                </div>
              )}
              <div className="flex justify-between border-t border-amber-100 py-[3px] text-sm">
                <b>Protein {perServing.protein}g</b>
                <span />
              </div>
            </div>

            {/* Vitamins & Minerals */}
            {(perServing.vitaminD > 0 || perServing.calcium > 0 || perServing.iron > 0 || perServing.potassium > 0 || perServing.vitaminC > 0 || perServing.vitaminA > 0) && (
              <div className="border-t-[4px] border-amber-700">
                {perServing.vitaminD > 0 && (
                  <div className="flex justify-between border-b border-amber-100 py-[3px] text-sm">
                    <span>Vitamin D {perServing.vitaminD}mcg</span>
                    <b>{dv(perServing.vitaminD, 20)}%</b>
                  </div>
                )}
                {perServing.calcium > 0 && (
                  <div className="flex justify-between border-b border-amber-100 py-[3px] text-sm">
                    <span>Calcium {Math.round(perServing.calcium)}mg</span>
                    <b>{dv(perServing.calcium, 1300)}%</b>
                  </div>
                )}
                {perServing.iron > 0 && (
                  <div className="flex justify-between border-b border-amber-100 py-[3px] text-sm">
                    <span>Iron {perServing.iron}mg</span>
                    <b>{dv(perServing.iron, 18)}%</b>
                  </div>
                )}
                {perServing.potassium > 0 && (
                  <div className="flex justify-between border-b border-amber-100 py-[3px] text-sm">
                    <span>Potassium {Math.round(perServing.potassium)}mg</span>
                    <b>{dv(perServing.potassium, 4700)}%</b>
                  </div>
                )}
                {perServing.vitaminC > 0 && (
                  <div className="flex justify-between border-b border-amber-100 py-[3px] text-sm">
                    <span>Vitamin C {perServing.vitaminC}mg</span>
                    <b>{dv(perServing.vitaminC, 90)}%</b>
                  </div>
                )}
                {perServing.vitaminA > 0 && (
                  <div className="flex justify-between border-b border-amber-100 py-[3px] text-sm">
                    <span>Vitamin A {perServing.vitaminA}mcg</span>
                    <b>{dv(perServing.vitaminA, 900)}%</b>
                  </div>
                )}
              </div>
            )}

            {/* Footnote */}
            <div className="mt-1 border-t border-amber-200 pt-1 text-[10px] leading-tight text-amber-500">
              * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
            </div>
            <p className="mt-1.5 text-[10px] text-amber-400">
              {trackedIngredients.length} of {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
