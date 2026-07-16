import "server-only"
import { getInitialContentItems } from "@/lib/data/content"
import { getCurrentOrgContext } from "@/lib/data/org"
import { scoreSeo } from "@/engines/seo"
import { scoreGeoReadiness, type GeoReadinessResult } from "@/engines/seo/geo"
import { generateTrackedKeywords, DEFAULT_TRACKED_KEYWORDS, type TrackedKeyword } from "@/engines/seo/keywords"
import type { ContentPiece } from "@/lib/types"

export interface ContentSeoRow {
  piece: ContentPiece
  seoScore: number
  geo: GeoReadinessResult
  topIssue: string | null
}

export interface SeoSnapshot {
  contentRows: ContentSeoRow[]
  avgSeoScore: number
  avgGeoScore: number
  trackedKeywords: TrackedKeyword[]
}

// Real analysis of actual Content Factory pieces (re-runs the same
// deterministic engines used when the content was created/edited) plus a
// clearly-labeled sample keyword rank tracker — see engines/seo/keywords.ts
// for why that part is seeded rather than live.
export async function getSeoSnapshot(): Promise<SeoSnapshot> {
  const [ctx, pieces] = await Promise.all([getCurrentOrgContext(), getInitialContentItems()])

  const contentRows: ContentSeoRow[] = pieces.map((piece) => {
    const activeVersion = piece.versions.find((v) => v.id === piece.activeVersionId) ?? piece.versions[piece.versions.length - 1]
    const body = activeVersion?.body ?? ""
    const seo = scoreSeo(body, piece.title, piece.brief.keywords)
    const geo = scoreGeoReadiness(body, piece.title)
    const topIssue = seo.checks.find((c) => !c.passed)?.label ?? geo.checks.find((c) => !c.passed)?.label ?? null

    return { piece, seoScore: seo.score, geo, topIssue }
  })

  const avgSeoScore = contentRows.length ? Math.round(contentRows.reduce((s, r) => s + r.seoScore, 0) / contentRows.length) : 0
  const avgGeoScore = contentRows.length ? Math.round(contentRows.reduce((s, r) => s + r.geo.score, 0) / contentRows.length) : 0

  const keywordsFromContent = [...new Set(pieces.flatMap((p) => p.brief.keywords))].filter(Boolean)
  const trackedKeywords = generateTrackedKeywords(
    ctx?.orgId ?? "demo-org",
    keywordsFromContent.length ? keywordsFromContent.slice(0, 8) : DEFAULT_TRACKED_KEYWORDS
  )

  return { contentRows, avgSeoScore, avgGeoScore, trackedKeywords }
}
