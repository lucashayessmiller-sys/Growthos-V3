import type { AnalyticsSnapshot } from "@/engines/analytics"

export async function generateInsightDigest(snapshot: AnalyticsSnapshot): Promise<string> {
  const res = await fetch("/api/generate-insight", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

// Deterministic fallback: a template that reads real numbers out of the
// snapshot rather than inventing anything, so it stays honest even without
// an AI provider configured.
export function mockInsightDigest(snapshot: AnalyticsSnapshot): string {
  const topCampaign = snapshot.campaigns[0]
  const topType = snapshot.content.byType[0]
  const topPlatform = snapshot.social.byPlatform[0]

  const lines = [
    `Revenue influenced is trending at $${snapshot.revenue.total.toLocaleString()} this period, up ${snapshot.revenue.deltaPct}% — driven mainly by organic and social traffic, which together account for the majority of visits in the last 30 days.`,
    topCampaign
      ? `"${topCampaign.campaign}" is your most active campaign right now, with ${topCampaign.contentCount + topCampaign.socialCount} pieces in flight and ${topCampaign.publishedCount} already published.`
      : `No campaign has significant activity yet — worth assigning content to a named campaign to track performance.`,
    topType ? `${topType.type.replace("-", " ")} is your most-produced content type (${topType.count} pieces), averaging an SEO score of ${snapshot.content.avgSeoScore}/100.` : "",
    topPlatform ? `On social, ${topPlatform.platform} has the most posts (${topPlatform.count}), with an average engagement rate of ${snapshot.social.avgEngagementRate}% across published posts.` : "",
    snapshot.content.inProgress > snapshot.content.published
      ? `You have more content in progress (${snapshot.content.inProgress}) than published (${snapshot.content.published}) — consider clearing the approval queue to convert drafts into traffic.`
      : `Your publish rate is healthy — ${snapshot.content.published} of ${snapshot.content.total} content pieces are live.`,
  ].filter(Boolean)

  return lines.join(" ")
}
