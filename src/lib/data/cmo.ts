import "server-only"
import { getInitialContentItems } from "@/lib/data/content"
import { getInitialSocialPosts } from "@/lib/data/social"
import { getAnalyticsSnapshot } from "@/lib/data/analytics"
import { getSeoSnapshot } from "@/lib/data/seo"
import { getReputationSnapshot } from "@/lib/data/reputation"
import { getCompetitorSnapshot } from "@/lib/data/competitor"
import { getInitialContacts, getInitialDeals } from "@/lib/data/crm"
import { getBrandKit } from "@/lib/data/brand"
import { getInitialLocations } from "@/lib/data/local"
import { getInitialCampaigns } from "@/lib/data/ads"
import { getCurrentOrgContext } from "@/lib/data/org"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { checkCompliance, computeComplianceStats } from "@/engines/brand"
import { computeListingCompleteness, auditNapConsistency } from "@/engines/local"
import { computePipelineStats } from "@/engines/crm"
import { computeAggregateStats } from "@/engines/ads"

export interface ModuleSignal {
  module: string
  href: string
  label: string
  value: string
  detail: string
  status: "good" | "watch" | "attention"
}

export interface BusinessSnapshot {
  signals: ModuleSignal[]
}

// This is the real "cross-module orchestration" — every number below comes
// from another module's own real data-access function. No new data source,
// no duplicated queries, nothing invented: AI CMO's entire value is in the
// composition, not in generating new numbers.
export async function getBusinessSnapshot(): Promise<BusinessSnapshot> {
  const [pieces, posts, analytics, seo, reputation, competitor, contacts, brandKit, locations, campaigns] = await Promise.all([
    getInitialContentItems(),
    getInitialSocialPosts(),
    getAnalyticsSnapshot(),
    getSeoSnapshot(),
    getReputationSnapshot(),
    getCompetitorSnapshot(),
    getInitialContacts(),
    getBrandKit(),
    getInitialLocations(),
    getInitialCampaigns(),
  ])
  const deals = await getInitialDeals(contacts)

  const pipelineStats = computePipelineStats(deals)
  const adsStats = computeAggregateStats(campaigns)

  const complianceResults = [
    ...pieces.map((p) => {
      const v = p.versions.find((x) => x.id === p.activeVersionId)
      return { issues: checkCompliance(v?.body ?? "", p.type, brandKit) }
    }),
    ...posts.map((p) => {
      const v = p.versions.find((x) => x.id === p.activeVersionId)
      return { issues: checkCompliance(v?.caption ?? "", null, brandKit) }
    }),
  ]
  const complianceStats = computeComplianceStats(complianceResults)

  const avgListingCompleteness = locations.length
    ? Math.round(locations.reduce((s, l) => s + computeListingCompleteness(l, locations).score, 0) / locations.length)
    : 0
  const napIssues = auditNapConsistency(locations)

  const signals: ModuleSignal[] = [
    {
      module: "CRM", href: "/crm", label: "Open pipeline value",
      value: `$${pipelineStats.totalValue.toLocaleString()}`, detail: `${pipelineStats.winRate}% win rate · ${contacts.length} contacts`,
      status: pipelineStats.totalValue > 5000 ? "good" : pipelineStats.totalValue > 0 ? "watch" : "attention",
    },
    {
      module: "Content Factory", href: "/content-factory", label: "Content published",
      value: `${seo.contentRows.filter((r) => r.piece.status === "published").length}/${pieces.length}`,
      detail: `Avg SEO score ${seo.avgSeoScore}/100`,
      status: seo.avgSeoScore >= 75 ? "good" : seo.avgSeoScore >= 50 ? "watch" : "attention",
    },
    {
      module: "Social Media", href: "/social-media", label: "Social engagement",
      value: `${analytics.social.avgEngagementRate}%`, detail: `${analytics.social.published} posts published`,
      status: analytics.social.avgEngagementRate >= 3 ? "good" : analytics.social.avgEngagementRate >= 1 ? "watch" : "attention",
    },
    {
      module: "Analytics", href: "/analytics", label: "Revenue influenced",
      value: `$${analytics.revenue.total.toLocaleString()}`, detail: `${analytics.revenue.deltaPct > 0 ? "+" : ""}${analytics.revenue.deltaPct}% trend`,
      status: analytics.revenue.deltaPct >= 5 ? "good" : analytics.revenue.deltaPct >= 0 ? "watch" : "attention",
    },
    {
      module: "Reputation", href: "/reputation", label: "Average rating",
      value: reputation.stats.avgRating.toFixed(1), detail: `${reputation.stats.responseRate}% response rate`,
      status: reputation.stats.avgRating >= 4.2 ? "good" : reputation.stats.avgRating >= 3.5 ? "watch" : "attention",
    },
    {
      module: "Competitor Intel", href: "/competitor-intel", label: "Share of voice",
      value: `${competitor.shareOfVoice.ourSharePct}%`, detail: `${competitor.keywordGaps.length} keyword gaps found`,
      status: competitor.shareOfVoice.ourSharePct >= 20 ? "good" : competitor.shareOfVoice.ourSharePct >= 10 ? "watch" : "attention",
    },
    {
      module: "Brand Guardian", href: "/brand-guardian", label: "Brand compliance",
      value: `${complianceStats.compliancePct}%`, detail: `${complianceStats.errorCount} hard violations`,
      status: complianceStats.compliancePct >= 85 ? "good" : complianceStats.compliancePct >= 60 ? "watch" : "attention",
    },
    {
      module: "Local Marketing", href: "/local-marketing", label: "Listing completeness",
      value: `${avgListingCompleteness}%`, detail: `${napIssues.length} NAP issues across ${locations.length} locations`,
      status: avgListingCompleteness >= 80 && napIssues.length === 0 ? "good" : avgListingCompleteness >= 50 ? "watch" : "attention",
    },
    {
      module: "Paid Ads", href: "/paid-ads", label: "Ad spend (active)",
      value: `$${adsStats.totalSpend.toLocaleString()}`, detail: `${adsStats.activeCampaigns} active, ${adsStats.avgCtr}% avg CTR`,
      status: adsStats.activeCampaigns > 0 ? "good" : "watch",
    },
  ]

  return { signals }
}

export interface CmoBrief {
  id: string
  activeVersionId: string
  versions: { id: string; createdAt: string; body: string; note: string; generatedBy: "ai" | "human" }[]
  status: "draft" | "approved"
  createdAt: string
  updatedAt: string
}

// AI CMO keeps exactly one ongoing brief per org (find-or-create), rather
// than an unbounded list — "regenerate" pushes a new version of the same
// brief, matching how a real weekly-planning cadence works.
export async function getCmoBrief(): Promise<CmoBrief | null> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return null

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("content_items")
    .select("*, content_versions(*)")
    .eq("org_id", ctx.orgId)
    .eq("type", "cmo-brief")
    .limit(1)
    .maybeSingle()

  if (!data) return null

  const versions = (data.content_versions ?? [])
    .sort((a: { created_at: string }, b: { created_at: string }) => +new Date(a.created_at) - +new Date(b.created_at))
    .map((v: { id: string; created_at: string; body: string; note: string | null; generated_by: "ai" | "human" }) => ({
      id: v.id, createdAt: v.created_at, body: v.body, note: v.note ?? "", generatedBy: v.generated_by,
    }))

  return {
    id: data.id,
    activeVersionId: data.active_version_id ?? versions[versions.length - 1]?.id ?? "",
    versions,
    status: data.status === "approved" ? "approved" : "draft",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
