import { NextRequest, NextResponse } from "next/server"
import type { CompetitorSnapshot } from "@/lib/data/competitor"
import { mockCompetitorDigest } from "@/lib/ai/competitor-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(snapshot: CompetitorSnapshot) {
  return `You are a competitive strategy assistant inside GrowthOS AI. Write a concise, 3-4 sentence competitive positioning summary based on this real data snapshot. Be specific with the numbers given, don't invent any. No preamble, no headers, just the summary text.

Our estimated share of voice: ${snapshot.shareOfVoice.ourSharePct}%.
Competitors tracked: ${snapshot.competitors.map((c) => `${c.name} (${c.estMonthlyTraffic.toLocaleString()} monthly visits, DA ${c.domainAuthority})`).join("; ")}.
Content keyword gaps (keywords competitors target that we don't): ${snapshot.keywordGaps.slice(0, 5).map((g) => `"${g.keyword}" (${g.competitorsTargeting.join(", ")})`).join("; ") || "none found"}.
Our tracked keyword count: ${snapshot.ourKeywordCount}.`
}

export async function POST(req: NextRequest) {
  try {
    const { snapshot } = (await req.json()) as { snapshot: CompetitorSnapshot }
    if (!snapshot) return NextResponse.json({ error: "A snapshot is required." }, { status: 400 })

    const result = await ai.generate({
      task: "competitor.digest",
      prompt: buildPrompt(snapshot),
      maxTokens: 350,
      fallback: () => mockCompetitorDigest(snapshot),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
