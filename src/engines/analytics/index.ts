// Deterministic analytics engine. No AI calls — aggregate math and
// synthetic-but-stable time series only, per GrowthOS AI's "analytics
// calculations / dashboard metrics should use deterministic code" rule.
import type { ContentPiece, SocialPost } from "@/lib/types"

export interface ContentStats {
  total: number
  published: number
  inProgress: number
  avgSeoScore: number
  avgReadability: number
  byType: { type: string; count: number }[]
}

export interface SocialStats {
  total: number
  published: number
  scheduled: number
  totalLikes: number
  totalComments: number
  totalReach: number
  avgEngagementRate: number
  byPlatform: { platform: string; count: number }[]
}

export interface CampaignRow {
  campaign: string
  contentCount: number
  socialCount: number
  publishedCount: number
  totalReach: number
}

export interface ChannelPoint {
  date: string
  organic: number
  social: number
  paid: number
  email: number
}

export interface AnalyticsSnapshot {
  content: ContentStats
  social: SocialStats
  campaigns: CampaignRow[]
  trafficSeries: ChannelPoint[]
  revenue: { total: number; deltaPct: number }
  leads: { total: number; deltaPct: number }
}

export function computeContentStats(pieces: ContentPiece[]): ContentStats {
  const total = pieces.length
  const published = pieces.filter((p) => p.status === "published").length
  const inProgress = total - published
  const scored = pieces.filter((p) => p.seoScore > 0)
  const avgSeoScore = scored.length ? Math.round(scored.reduce((s, p) => s + p.seoScore, 0) / scored.length) : 0
  const avgReadability = total ? Math.round(pieces.reduce((s, p) => s + p.readabilityScore, 0) / total) : 0

  const typeCounts = new Map<string, number>()
  for (const p of pieces) typeCounts.set(p.type, (typeCounts.get(p.type) ?? 0) + 1)

  return {
    total,
    published,
    inProgress,
    avgSeoScore,
    avgReadability,
    byType: [...typeCounts.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
  }
}

export function computeSocialStats(posts: SocialPost[]): SocialStats {
  const total = posts.length
  const published = posts.filter((p) => p.status === "published").length
  const scheduled = posts.filter((p) => p.status === "scheduled").length

  const withEngagement = posts.filter((p) => p.engagement)
  const totalLikes = withEngagement.reduce((s, p) => s + (p.engagement?.likes ?? 0), 0)
  const totalComments = withEngagement.reduce((s, p) => s + (p.engagement?.comments ?? 0), 0)
  const totalReach = withEngagement.reduce((s, p) => s + (p.engagement?.reach ?? 0), 0)
  const avgEngagementRate = totalReach > 0 ? Math.round(((totalLikes + totalComments) / totalReach) * 1000) / 10 : 0

  const platformCounts = new Map<string, number>()
  for (const p of posts) platformCounts.set(p.platform, (platformCounts.get(p.platform) ?? 0) + 1)

  return {
    total,
    published,
    scheduled,
    totalLikes,
    totalComments,
    totalReach,
    avgEngagementRate,
    byPlatform: [...platformCounts.entries()].map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count),
  }
}

export function computeCampaignBreakdown(pieces: ContentPiece[], posts: SocialPost[]): CampaignRow[] {
  const campaigns = new Map<string, CampaignRow>()

  function ensure(name: string): CampaignRow {
    if (!campaigns.has(name)) campaigns.set(name, { campaign: name, contentCount: 0, socialCount: 0, publishedCount: 0, totalReach: 0 })
    return campaigns.get(name)!
  }

  for (const p of pieces) {
    const row = ensure(p.campaign)
    row.contentCount += 1
    if (p.status === "published") row.publishedCount += 1
  }
  for (const p of posts) {
    const row = ensure(p.campaign)
    row.socialCount += 1
    if (p.status === "published") row.publishedCount += 1
    row.totalReach += p.engagement?.reach ?? 0
  }

  return [...campaigns.values()].sort((a, b) => (b.contentCount + b.socialCount) - (a.contentCount + a.socialCount))
}

// Deterministic pseudo-random generator seeded by a string, so the same
// org/date always produces the same series — stable across reloads without
// a real analytics pipeline behind it yet.
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

export function computeTrafficSeries(seed: string, days = 30): ChannelPoint[] {
  const rand = seededRandom(seed)
  const points: ChannelPoint[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const weekday = date.getDay()
    const weekendDip = weekday === 0 || weekday === 6 ? 0.7 : 1
    const growthFactor = 1 + ((days - i) / days) * 0.35 // gentle upward trend

    points.push({
      date: date.toISOString().slice(0, 10),
      organic: Math.round((320 + rand() * 180) * weekendDip * growthFactor),
      social: Math.round((140 + rand() * 120) * weekendDip * growthFactor),
      paid: Math.round((90 + rand() * 70) * weekendDip),
      email: Math.round((40 + rand() * 50) * (weekday === 2 || weekday === 4 ? 1.6 : 0.8)),
    })
  }
  return points
}

export function buildSnapshot(orgId: string, pieces: ContentPiece[], posts: SocialPost[]): AnalyticsSnapshot {
  const trafficSeries = computeTrafficSeries(orgId)
  const totalTraffic = trafficSeries.reduce((s, p) => s + p.organic + p.social + p.paid + p.email, 0)
  const rand = seededRandom(orgId + "-revenue")

  return {
    content: computeContentStats(pieces),
    social: computeSocialStats(posts),
    campaigns: computeCampaignBreakdown(pieces, posts),
    trafficSeries,
    revenue: { total: Math.round(totalTraffic * (2.1 + rand() * 0.8)), deltaPct: Math.round((8 + rand() * 14) * 10) / 10 },
    leads: { total: Math.round(totalTraffic * 0.018), deltaPct: Math.round((4 + rand() * 10) * 10) / 10 },
  }
}
