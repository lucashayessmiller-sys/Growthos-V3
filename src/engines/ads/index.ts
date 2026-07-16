// Deterministic ad-performance simulation. There's no live Meta/Google/
// TikTok Ads connection here (each needs its own OAuth + ad account
// access), so once a campaign is marked active, its performance is a
// stable, seeded time series rather than fabricated random numbers on
// every load — clearly labeled everywhere it's shown. Swap-in point for a
// real integration: replace computePacingSeries()/computeCampaignStats()
// with a query against each platform's reporting API, keeping the shapes.
import type { AdCampaign, AdPlatform } from "@/lib/types"

export interface AdDayPoint {
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
}

export interface CampaignPerformance {
  series: AdDayPoint[]
  totalSpend: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  ctr: number
  cpc: number
  cpa: number
  pacing: "under" | "on-track" | "over"
  pacingPct: number
}

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

const PLATFORM_CPM: Record<AdPlatform, number> = { meta: 9, google: 14, tiktok: 7 }
const PLATFORM_CTR: Record<AdPlatform, number> = { meta: 0.012, google: 0.021, tiktok: 0.009 }

export function computeCampaignPerformance(campaign: AdCampaign): CampaignPerformance | null {
  if (campaign.status === "draft") return null

  const start = campaign.startDate ? new Date(campaign.startDate) : new Date(campaign.createdAt)
  const today = new Date()
  const end = campaign.status === "ended" && campaign.endDate ? new Date(campaign.endDate) : today
  const daysRun = Math.max(1, Math.min(60, Math.round((Math.min(end.getTime(), today.getTime()) - start.getTime()) / 86_400_000) + 1))

  const rand = seededRandom(campaign.id)
  const cpm = PLATFORM_CPM[campaign.platform]
  const baseCtr = PLATFORM_CTR[campaign.platform]

  const series: AdDayPoint[] = []
  for (let i = 0; i < daysRun; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    // Spend paces toward the daily budget with natural day-to-day variance.
    const spend = Math.round(campaign.budgetDaily * (0.75 + rand() * 0.4) * 100) / 100
    const impressions = Math.round((spend / cpm) * 1000)
    const clicks = Math.round(impressions * baseCtr * (0.7 + rand() * 0.6))
    const conversions = campaign.objective === "conversions" || campaign.objective === "leads"
      ? Math.round(clicks * (0.04 + rand() * 0.06))
      : Math.round(clicks * (0.01 + rand() * 0.02))
    series.push({ date: date.toISOString().slice(0, 10), spend, impressions, clicks, conversions })
  }

  const totalSpend = Math.round(series.reduce((s, d) => s + d.spend, 0) * 100) / 100
  const totalImpressions = series.reduce((s, d) => s + d.impressions, 0)
  const totalClicks = series.reduce((s, d) => s + d.clicks, 0)
  const totalConversions = series.reduce((s, d) => s + d.conversions, 0)

  const ctr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0
  const cpc = totalClicks > 0 ? Math.round((totalSpend / totalClicks) * 100) / 100 : 0
  const cpa = totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0

  const plannedSpend = campaign.budgetDaily * daysRun
  const pacingPct = plannedSpend > 0 ? Math.round((totalSpend / plannedSpend) * 100) : 100
  const pacing = pacingPct > 110 ? "over" : pacingPct < 90 ? "under" : "on-track"

  return { series, totalSpend, totalImpressions, totalClicks, totalConversions, ctr, cpc, cpa, pacing, pacingPct }
}

export interface AdsAggregateStats {
  activeCampaigns: number
  totalSpend: number
  avgCtr: number
  avgCpa: number
}

export function computeAggregateStats(campaigns: AdCampaign[]): AdsAggregateStats {
  const withPerf = campaigns.map((c) => ({ c, perf: computeCampaignPerformance(c) })).filter((x) => x.perf !== null) as { c: AdCampaign; perf: CampaignPerformance }[]

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length
  const totalSpend = Math.round(withPerf.reduce((s, x) => s + x.perf.totalSpend, 0) * 100) / 100
  const avgCtr = withPerf.length ? Math.round((withPerf.reduce((s, x) => s + x.perf.ctr, 0) / withPerf.length) * 10) / 10 : 0
  const cpaValues = withPerf.filter((x) => x.perf.cpa > 0)
  const avgCpa = cpaValues.length ? Math.round((cpaValues.reduce((s, x) => s + x.perf.cpa, 0) / cpaValues.length) * 100) / 100 : 0

  return { activeCampaigns, totalSpend, avgCtr, avgCpa }
}
