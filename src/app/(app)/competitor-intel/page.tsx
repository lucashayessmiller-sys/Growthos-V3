import { getCompetitorSnapshot } from "@/lib/data/competitor"
import { CompetitorKpiCards } from "@/components/modules/competitor/kpi-cards"
import { ShareOfVoiceChart } from "@/components/modules/competitor/share-of-voice-chart"
import { CompetitorTable } from "@/components/modules/competitor/competitor-table"
import { KeywordGapTable } from "@/components/modules/competitor/keyword-gap-table"
import { CompetitorDigest } from "@/components/modules/competitor/digest"

// Server Component end to end except the traffic chart (Recharts) and the
// AI digest's regenerate button. Competitor metrics are sample data (no
// live SEMrush/Ahrefs/SimilarWeb integration); the keyword-gap analysis and
// our own traffic figure are computed from real workspace data.
export default async function CompetitorIntelPage() {
  const snapshot = await getCompetitorSnapshot()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Competitor Intelligence</h1>
        <p className="text-sm text-muted mt-0.5">Track competitor moves across SEO, ads, social, and pricing.</p>
      </div>

      <div className="space-y-5">
        <CompetitorKpiCards snapshot={snapshot} />
        <CompetitorDigest snapshot={snapshot} />
        <ShareOfVoiceChart rows={snapshot.shareOfVoice.rows} />
        <CompetitorTable competitors={snapshot.competitors} />
        <KeywordGapTable gaps={snapshot.keywordGaps} />
      </div>
    </div>
  )
}
