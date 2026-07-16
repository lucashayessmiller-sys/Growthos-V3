import "server-only"
import { getInitialContentItems } from "@/lib/data/content"
import { getCurrentOrgContext } from "@/lib/data/org"
import { generateCompetitors } from "@/engines/competitor/seed"
import { computeShareOfVoice, computeKeywordGaps, type ShareOfVoiceRow, type KeywordGap } from "@/engines/competitor"
import { computeTrafficSeries } from "@/engines/analytics"
import type { Competitor } from "@/lib/types"

export interface CompetitorSnapshot {
  competitors: Competitor[]
  shareOfVoice: { rows: ShareOfVoiceRow[]; ourSharePct: number }
  keywordGaps: KeywordGap[]
  ourKeywordCount: number
}

// Competitor metrics are sample data (see engines/competitor/seed.ts — no
// live SEMrush/Ahrefs/SimilarWeb integration). Our own traffic figure and
// keyword set are real: the same synthetic-but-stable traffic series
// Analytics AI uses, and the actual keywords from Content Factory briefs.
export async function getCompetitorSnapshot(): Promise<CompetitorSnapshot> {
  const [ctx, pieces] = await Promise.all([getCurrentOrgContext(), getInitialContentItems()])
  const orgSeed = ctx?.orgId ?? "demo-org"

  const competitors = generateCompetitors(orgSeed)
  const trafficSeries = computeTrafficSeries(orgSeed)
  const ourTraffic = trafficSeries.reduce((s, p) => s + p.organic + p.social + p.paid + p.email, 0)

  const ourKeywords = [...new Set(pieces.flatMap((p) => p.brief.keywords))].filter(Boolean)

  return {
    competitors,
    shareOfVoice: computeShareOfVoice(ourTraffic, competitors),
    keywordGaps: computeKeywordGaps(ourKeywords, competitors),
    ourKeywordCount: ourKeywords.length,
  }
}
