"use client"

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"

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
}

const s = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", backgroundColor: "#fffbf5" },
  header: { marginBottom: 24, borderBottom: "2pt solid #d97706", paddingBottom: 16 },
  title: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#92400e" },
  category: {
    marginTop: 4,
    fontSize: 10,
    color: "#b45309",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  description: { marginTop: 8, fontSize: 12, color: "#78350f", lineHeight: 1.5 },
  meta: { flexDirection: "row", gap: 24, marginTop: 12 },
  metaItem: { fontSize: 11, color: "#92400e" },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ingredientRow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "flex-start",
  },
  ingredientAmount: { fontSize: 11, color: "#b45309", width: 80 },
  ingredientName: { fontSize: 11, color: "#1a1209", flex: 1 },
  instructionRow: { flexDirection: "row", marginBottom: 10, gap: 8 },
  instructionNumber: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#b45309",
    width: 20,
  },
  instructionText: { fontSize: 11, color: "#1a1209", flex: 1, lineHeight: 1.5 },
  recipeImage: { width: "100%", height: 200, objectFit: "cover", borderRadius: 8, marginBottom: 16 },
})

export function RecipePDFDocument({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {recipe.imageUrl && (
          <Image src={recipe.imageUrl} style={s.recipeImage} />
        )}
        <View style={s.header}>
          <Text style={s.title}>{recipe.title}</Text>
          {recipe.category && <Text style={s.category}>{recipe.category}</Text>}
          {recipe.description && <Text style={s.description}>{recipe.description}</Text>}
          <View style={s.meta}>
            {recipe.servings > 0 && (
              <Text style={s.metaItem}>Servings: {recipe.servings}</Text>
            )}
            {recipe.prepTime > 0 && (
              <Text style={s.metaItem}>Prep: {recipe.prepTime} min</Text>
            )}
            {recipe.cookTime > 0 && (
              <Text style={s.metaItem}>Cook: {recipe.cookTime} min</Text>
            )}
            {totalTime > 0 && (
              <Text style={s.metaItem}>Total: {totalTime} min</Text>
            )}
          </View>
        </View>

        {recipe.ingredients.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={s.ingredientRow}>
                <Text style={s.ingredientAmount}>
                  {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                </Text>
                <Text style={s.ingredientName}>{ing.name}</Text>
              </View>
            ))}
          </View>
        )}

        {recipe.instructions.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={s.instructionRow}>
                <Text style={s.instructionNumber}>{i + 1}.</Text>
                <Text style={s.instructionText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
