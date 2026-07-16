import { NextRequest, NextResponse } from "next/server"
import type { BrandSnapshot } from "@/engines/brand"
import { mockBrandDigest } from "@/lib/ai/brand-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(snapshot: BrandSnapshot) {
  return `You are a brand compliance assistant inside GrowthOS AI. Write a concise, 3-4 sentence summary of these real brand-compliance scan results. Be specific with the numbers given, don't invent any. No preamble, no headers, just the summary text.

Total content scanned: ${snapshot.stats.total}
Fully compliant: ${snapshot.stats.passed} (${snapshot.stats.compliancePct}%)
Hard violations: ${snapshot.stats.errorCount}
Style warnings: ${snapshot.stats.warningCount}
Top recurring issues: ${snapshot.stats.topIssues.map((i) => `${i.message} (${i.count}x)`).join("; ") || "none"}
Brand tone: ${snapshot.brandKit.tone}
Banned words configured: ${snapshot.brandKit.bannedWords.join(", ") || "none"}`
}

export async function POST(req: NextRequest) {
  try {
    const { snapshot } = (await req.json()) as { snapshot: BrandSnapshot }
    if (!snapshot) return NextResponse.json({ error: "A snapshot is required." }, { status: 400 })

    const result = await ai.generate({
      task: "brand.digest",
      prompt: buildPrompt(snapshot),
      maxTokens: 350,
      fallback: () => mockBrandDigest(snapshot),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
