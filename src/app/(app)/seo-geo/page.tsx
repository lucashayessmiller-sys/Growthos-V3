import { getSeoSnapshot } from "@/lib/data/seo"
import { SeoKpiCards } from "@/components/modules/seo/kpi-cards"
import { ContentSeoTable } from "@/components/modules/seo/content-seo-table"
import { KeywordTracker } from "@/components/modules/seo/keyword-tracker"
import { KeywordOpportunityFinder } from "@/components/modules/seo/keyword-opportunity-finder"

// Server Component end to end except the rank-tracker chart (Recharts) and
// the keyword-opportunity finder (needs input state). The content SEO/GEO
// table is real analysis of actual Content Factory pieces via the
// deterministic engines; the rank tracker is clearly labeled sample data
// since there's no live SERP-tracking integration in this build.
export default async function SeoGeoPage() {
  const snapshot = await getSeoSnapshot()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">SEO + AI GEO Engine</h1>
        <p className="text-sm text-muted mt-0.5">Rank tracking, technical SEO, and readiness for AI answer engines.</p>
      </div>

      <div className="space-y-5">
        <SeoKpiCards snapshot={snapshot} />
        <ContentSeoTable rows={snapshot.contentRows} />
        <KeywordTracker keywords={snapshot.trackedKeywords} />
        <KeywordOpportunityFinder />
      </div>
    </div>
  )
}
