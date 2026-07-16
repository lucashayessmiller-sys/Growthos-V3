import type { Competitor } from "@/lib/types"

export interface ShareOfVoiceRow {
  name: string
  domain: string | null
  traffic: number
  isUs: boolean
}

export interface KeywordGap {
  keyword: string
  competitorsTargeting: string[]
}

// Deterministic comparison math only — no AI call. The "us" traffic figure
// comes from Analytics AI's real synthetic series (itself computed from
// actual content/social activity); competitor traffic is sample data.
export function computeShareOfVoice(ourTraffic: number, competitors: Competitor[]): { rows: ShareOfVoiceRow[]; ourSharePct: number } {
  const rows: ShareOfVoiceRow[] = [
    { name: "You", domain: null, traffic: ourTraffic, isUs: true },
    ...competitors.map((c) => ({ name: c.name, domain: c.domain, traffic: c.estMonthlyTraffic, isUs: false })),
  ].sort((a, b) => b.traffic - a.traffic)

  const total = rows.reduce((s, r) => s + r.traffic, 0)
  const ourSharePct = total > 0 ? Math.round((ourTraffic / total) * 1000) / 10 : 0

  return { rows, ourSharePct }
}

// Real gap analysis: keywords competitors are seeded to target that don't
// appear anywhere in our actual Content Factory briefs.
export function computeKeywordGaps(ourKeywords: string[], competitors: Competitor[]): KeywordGap[] {
  const ourSet = new Set(ourKeywords.map((k) => k.toLowerCase()))
  const gapMap = new Map<string, Set<string>>()

  for (const c of competitors) {
    for (const kw of c.topKeywords) {
      if (ourSet.has(kw.toLowerCase())) continue
      if (!gapMap.has(kw)) gapMap.set(kw, new Set())
      gapMap.get(kw)!.add(c.name)
    }
  }

  return [...gapMap.entries()]
    .map(([keyword, names]) => ({ keyword, competitorsTargeting: [...names] }))
    .sort((a, b) => b.competitorsTargeting.length - a.competitorsTargeting.length)
}
