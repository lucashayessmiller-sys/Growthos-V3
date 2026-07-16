import { NextRequest, NextResponse } from "next/server"
import { mockKeywordOpportunities } from "@/lib/ai/keyword-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(topic: string) {
  return `You are an SEO strategist inside GrowthOS AI. Suggest 6 long-tail keyword opportunities related to "${topic}".

Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:
[{"keyword": "...", "intent": "Informational" | "Commercial" | "Transactional" | "Navigational", "estDifficulty": "Low" | "Medium" | "High", "rationale": "one sentence on why this is worth targeting"}]

These are AI-estimated suggestions to validate against real search data, not guaranteed search volumes.`
}

export async function POST(req: NextRequest) {
  try {
    const { topic } = (await req.json()) as { topic: string }
    if (!topic?.trim()) return NextResponse.json({ error: "A topic is required." }, { status: 400 })

    const result = await ai.generate({
      task: "seo.keywords",
      prompt: buildPrompt(topic),
      maxTokens: 700,
      cacheKey: `keywords:${topic.toLowerCase()}`,
      fallback: () => JSON.stringify(mockKeywordOpportunities(topic)),
    })

    try {
      const cleaned = result.text.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) return NextResponse.json({ keywords: parsed, source: result.provider })
    } catch {
      // fall through
    }
    return NextResponse.json({ keywords: mockKeywordOpportunities(topic), source: "deterministic-fallback" })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
