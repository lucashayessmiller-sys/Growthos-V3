import { NextRequest, NextResponse } from "next/server"
import type { Location } from "@/lib/types"
import { mockLocationDescription } from "@/lib/ai/local-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(location: Location) {
  return `You are writing a local business listing description (for Google Business Profile style listings) for a location of Northbound Outfitters, an outdoor and lifestyle retailer. Keep it under 60 words, warm and specific, no generic corporate language. Return only the description text.

Location: ${location.name}
Address: ${location.address || "not set"}, ${location.city || ""} ${location.region || ""}
Hours: ${location.hours || "not set"}`
}

export async function POST(req: NextRequest) {
  try {
    const { location } = (await req.json()) as { location: Location }
    if (!location?.name) return NextResponse.json({ error: "A location is required." }, { status: 400 })

    const result = await ai.generate({
      task: "local.description",
      prompt: buildPrompt(location),
      maxTokens: 200,
      cacheKey: `location-desc:${location.id}`,
      fallback: () => mockLocationDescription(location),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
