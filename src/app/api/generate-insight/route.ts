import { NextRequest, NextResponse } from "next/server"
import type { AnalyticsSnapshot } from "@/engines/analytics"
import { mockInsightDigest } from "@/lib/ai/insight-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(snapshot: AnalyticsSnapshot) {
  return `You are a marketing analytics assistant inside GrowthOS AI. Write a concise, 3-5 sentence performance digest for a business owner based on this real data snapshot. Be specific with the numbers given, don't invent any. No preamble, no headers, just the digest text.

Content: ${snapshot.content.total} total pieces, ${snapshot.content.published} published, ${snapshot.content.inProgress} in progress, average SEO score ${snapshot.content.avgSeoScore}/100.
Top content types: ${snapshot.content.byType.slice(0, 3).map((t) => `${t.type} (${t.count})`).join(", ") || "none"}.
Social: ${snapshot.social.total} posts, ${snapshot.social.published} published, ${snapshot.social.totalLikes} total likes, ${snapshot.social.totalReach} total reach, ${snapshot.social.avgEngagementRate}% avg engagement rate.
Top platforms: ${snapshot.social.byPlatform.slice(0, 3).map((p) => `${p.platform} (${p.count})`).join(", ") || "none"}.
Top campaigns: ${snapshot.campaigns.slice(0, 3).map((c) => `${c.campaign} (${c.contentCount + c.socialCount} items, ${c.publishedCount} published)`).join(", ") || "none"}.
Revenue influenced: $${snapshot.revenue.total.toLocaleString()}, up ${snapshot.revenue.deltaPct}%.
Leads: ${snapshot.leads.total.toLocaleString()}, up ${snapshot.leads.deltaPct}%.`
}

export async function POST(req: NextRequest) {
  try {
    const { snapshot } = (await req.json()) as { snapshot: AnalyticsSnapshot }
    if (!snapshot) return NextResponse.json({ error: "A snapshot is required." }, { status: 400 })

    const result = await ai.generate({
      task: "analytics.digest",
      prompt: buildPrompt(snapshot),
      maxTokens: 400,
      // Deliberately uncached — each regeneration should read as fresh
      // commentary, and the snapshot itself already changes slowly.
      fallback: () => mockInsightDigest(snapshot),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
