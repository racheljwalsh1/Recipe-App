"use client"

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { ReactNode } from "react"

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

const s = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    borderBottom: "1pt solid #cccccc",
    paddingBottom: 12,
    gap: 16,
  },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#000000" },
  category: {
    marginTop: 3,
    fontSize: 9,
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  description: { marginTop: 6, fontSize: 10, color: "#333333", lineHeight: 1.4 },
  meta: { flexDirection: "row", gap: 16, marginTop: 8, flexWrap: "wrap" },
  metaItem: { fontSize: 10, color: "#333333" },
  recipeImage: { width: 110, height: 110, objectFit: "cover", borderRadius: 4 },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "0.5pt solid #dddddd",
    paddingBottom: 3,
  },
  ingredientsGrid: { flexDirection: "row", flexWrap: "wrap" },
  ingredientRow: {
    flexDirection: "row",
    marginBottom: 3,
    alignItems: "flex-start",
    width: "50%",
  },
  ingredientAmount: { fontSize: 10, color: "#333333", width: 60 },
  ingredientName: { fontSize: 10, color: "#000000", flex: 1 },
  instructionRow: { flexDirection: "row", marginBottom: 6, gap: 6 },
  instructionNumber: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    width: 18,
  },
  instructionText: { fontSize: 10, color: "#000000", flex: 1, lineHeight: 1.4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
  tag: {
    fontSize: 9,
    color: "#333333",
    borderRadius: 10,
    border: "0.5pt solid #aaaaaa",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  notesPara: { fontSize: 10, color: "#000000", lineHeight: 1.4, marginBottom: 3 },
  notesH2: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#000000", marginTop: 6, marginBottom: 2 },
  notesH3: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#000000", marginTop: 4, marginBottom: 2 },
  notesListItem: { flexDirection: "row", marginBottom: 2, paddingLeft: 8 },
  notesBullet: { fontSize: 10, color: "#000000", width: 14 },
  notesListText: { fontSize: 10, color: "#000000", flex: 1, lineHeight: 1.4 },
  notesBlockquote: {
    borderLeft: "2pt solid #aaaaaa",
    paddingLeft: 8,
    marginBottom: 3,
  },
})

// Renders inline nodes (text + bold/italic/etc) as react-pdf Text children
function renderInline(nodes: NodeList, key: string): ReactNode[] {
  return Array.from(nodes).map((node, i) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? ""
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null
    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (tag === "strong" || tag === "b")
      return <Text key={`${key}-${i}`} style={{ fontFamily: "Helvetica-Bold" }}>{el.textContent}</Text>
    if (tag === "em" || tag === "i")
      return <Text key={`${key}-${i}`} style={{ fontFamily: "Helvetica-Oblique" }}>{el.textContent}</Text>
    if (tag === "s")
      return <Text key={`${key}-${i}`} style={{ textDecoration: "line-through" }}>{el.textContent}</Text>
    if (tag === "br") return "\n"
    return el.textContent ?? ""
  })
}

// Renders block-level HTML nodes to react-pdf View/Text elements
function renderBlock(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent?.trim()
    return t ? <Text key={key} style={s.notesPara}>{t}</Text> : null
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null
  const el = node as Element
  const tag = el.tagName.toLowerCase()

  if (tag === "h2") return <Text key={key} style={s.notesH2}>{el.textContent}</Text>
  if (tag === "h3") return <Text key={key} style={s.notesH3}>{el.textContent}</Text>

  if (tag === "ul" || tag === "ol") {
    const items = Array.from(el.children).filter(c => c.tagName.toLowerCase() === "li")
    return (
      <View key={key} style={{ marginBottom: 3 }}>
        {items.map((li, i) => (
          <View key={`${key}-${i}`} style={s.notesListItem}>
            <Text style={s.notesBullet}>{tag === "ol" ? `${i + 1}.` : "•"}</Text>
            <Text style={s.notesListText}>{renderInline(li.childNodes, `${key}-${i}`)}</Text>
          </View>
        ))}
      </View>
    )
  }

  if (tag === "blockquote") {
    return (
      <View key={key} style={s.notesBlockquote}>
        <Text style={s.notesPara}>{renderInline(el.childNodes, key)}</Text>
      </View>
    )
  }

  // p and anything else
  return <Text key={key} style={s.notesPara}>{renderInline(el.childNodes, key)}</Text>
}

function renderNotesHtml(html: string): ReactNode[] {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return Array.from(doc.body.childNodes)
    .map((node, i) => renderBlock(node, `notes-${i}`))
    .filter(Boolean)
}

export function RecipePDFDocument({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headerText}>
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
          {recipe.imageUrl && (
            <Image src={recipe.imageUrl} style={s.recipeImage} />
          )}
        </View>

        {recipe.ingredients.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ingredients</Text>
            <View style={s.ingredientsGrid}>
              {recipe.ingredients.map((ing, i) => (
                <View key={i} style={s.ingredientRow}>
                  <Text style={s.ingredientAmount}>
                    {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                  </Text>
                  <Text style={s.ingredientName}>{ing.name}</Text>
                </View>
              ))}
            </View>
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

        {recipe.notes && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Notes</Text>
            <View>{renderNotesHtml(recipe.notes)}</View>
          </View>
        )}

        {recipe.tags.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tags</Text>
            <View style={s.tagsRow}>
              {recipe.tags.map((tag, i) => (
                <Text key={i} style={s.tag}>{tag}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}
