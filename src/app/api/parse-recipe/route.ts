import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are a recipe parser. Extract structured data from recipe text and return valid JSON only — no markdown, no explanation, no code fences.

Return this exact shape:
{
  "title": string,
  "description": string,
  "servings": number,
  "prepTime": number,
  "cookTime": number,
  "category": string,
  "ingredients": [{ "amount": string, "unit": string, "name": string }],
  "instructions": [string]
}

Rules:
- prepTime and cookTime are integers in minutes. Use 0 if unknown.
- servings is an integer, defaults to 4 if not mentioned.
- amount is a string like "2", "1/2", "1/4" — convert unicode fractions to slash form.
- unit is like "cups", "tbsp", "tsp", "g", "oz", "ml", "lb" — empty string if none.
- name is the ingredient name only, without amount or unit.
- instructions is an array of step strings with no "Step 1:" prefix.
- category must be one of: Breakfast, Lunch, Dinner, Dessert, Snack, Drink, Other — or empty string if unclear.
- description: 1-2 sentence summary of the dish, or empty string if nothing meaningful to say.`

export async function POST(request: Request) {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const { text } = await request.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: text.trim() }],
    })

    const raw = message.content[0].type === "text" ? message.content[0].text : ""
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim()
    const parsed = JSON.parse(stripped)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error("parse-recipe error:", err)
    return NextResponse.json({ error: "Failed to parse recipe" }, { status: 500 })
  }
}
