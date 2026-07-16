import { getAnalyticsSnapshot } from "@/lib/data/analytics"
import { KpiCards } from "@/components/modules/analytics/kpi-cards"
import { TrafficChart } from "@/components/modules/analytics/traffic-chart"
import { ContentTypeChart, PlatformChart } from "@/components/modules/analytics/breakdown-charts"
import { CampaignTable } from "@/components/modules/analytics/campaign-table"
import { InsightDigest } from "@/components/modules/analytics/insight-digest"

// Server Component end to end except for two small client boundaries: the
// Recharts visualizations (client-only by nature) and the AI insight
// digest (needs a regenerate button). Everything else — KPI cards, the
// campaign table — is plain server-rendered markup from data computed in
// lib/data/analytics.ts, which itself just recomposes Content Factory's
// and Social Media Manager's existing data through a deterministic engine.
export default async function AnalyticsPage() {
  const snapshot = await getAnalyticsSnapshot()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Analytics AI</h1>
        <p className="text-sm text-muted mt-0.5">Unified reporting across content and social, with an AI-generated read on what it means.</p>
      </div>

      <div className="space-y-5">
        <KpiCards snapshot={snapshot} />
        <InsightDigest snapshot={snapshot} />
        <TrafficChart data={snapshot.trafficSeries} />
        <div className="grid gap-5 lg:grid-cols-2">
          <ContentTypeChart stats={snapshot.content} />
          <PlatformChart stats={snapshot.social} />
        </div>
        <CampaignTable rows={snapshot.campaigns} />
      </div>
    </div>
  )
}
