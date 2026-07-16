import type { CompetitorSnapshot } from "@/lib/data/competitor"

export async function generateCompetitorDigest(snapshot: CompetitorSnapshot): Promise<string> {
  const res = await fetch("/api/generate-competitor-digest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

export function mockCompetitorDigest(snapshot: CompetitorSnapshot): string {
  const leader = snapshot.shareOfVoice.rows.find((r) => !r.isUs)
  const topGap = snapshot.keywordGaps[0]

  const lines = [
    `You currently hold ${snapshot.shareOfVoice.ourSharePct}% estimated share of voice against ${snapshot.competitors.length} tracked competitors.`,
    leader ? `${leader.name} has the largest estimated footprint in the set, with roughly ${leader.traffic.toLocaleString()} monthly visits.` : "",
    topGap
      ? `The clearest content gap right now is "${topGap.keyword}" — targeted by ${topGap.competitorsTargeting.join(", ")} but not yet covered in your content.`
      : `No major keyword gaps found — your content already covers the keywords your tracked competitors are targeting.`,
    snapshot.keywordGaps.length > 1
      ? `${snapshot.keywordGaps.length - 1} additional gap keyword${snapshot.keywordGaps.length > 2 ? "s" : ""} worth reviewing in the table below.`
      : "",
  ].filter(Boolean)

  return lines.join(" ")
}
