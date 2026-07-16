import "server-only"
import { generateReviews } from "@/engines/reputation/seed"
import { computeReviewStats, type ReviewStats } from "@/engines/reputation"
import { getCurrentOrgContext } from "@/lib/data/org"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Review } from "@/lib/types"

export interface ReviewResponseVersion {
  id: string
  createdAt: string
  body: string
  note: string
  generatedBy: "ai" | "human"
}

export interface ReviewWithResponse extends Review {
  responseStatus: "none" | "draft" | "published"
  activeVersionId: string | null
  versions: ReviewResponseVersion[]
}

export interface ReputationSnapshot {
  reviews: ReviewWithResponse[]
  stats: ReviewStats
}

// Reviews themselves are seeded (deterministic, stable ids per org — see
// engines/reputation/seed.ts) since there's no live Google/Yelp/Facebook
// review API connected. Responses ARE real: stored as content_items rows
// (type = 'review-response') so they persist through Supabase exactly like
// Content Factory pieces do, reusing the same table rather than adding one.
export async function getReputationSnapshot(): Promise<ReputationSnapshot> {
  const ctx = await getCurrentOrgContext()
  const baseReviews = generateReviews(ctx?.orgId ?? "demo-org")

  const responsesByReviewId = new Map<string, { status: string; activeVersionId: string | null; versions: ReviewResponseVersion[] }>()

  const supabase = ctx ? await createSupabaseServerClient() : null
  if (supabase && ctx) {
    const { data } = await supabase
      .from("content_items")
      .select("*, content_versions(*)")
      .eq("org_id", ctx.orgId)
      .eq("type", "review-response")

    for (const row of data ?? []) {
      const reviewId = (row.brief as { reviewId?: string })?.reviewId
      if (!reviewId) continue
      const versions: ReviewResponseVersion[] = (row.content_versions ?? [])
        .sort((a: { created_at: string }, b: { created_at: string }) => +new Date(a.created_at) - +new Date(b.created_at))
        .map((v: { id: string; created_at: string; body: string; note: string | null; generated_by: "ai" | "human" }) => ({
          id: v.id, createdAt: v.created_at, body: v.body, note: v.note ?? "", generatedBy: v.generated_by,
        }))
      responsesByReviewId.set(reviewId, {
        status: row.status === "published" ? "published" : "draft",
        activeVersionId: row.active_version_id,
        versions,
      })
    }
  }

  const reviews: ReviewWithResponse[] = baseReviews.map((review) => {
    const stored = responsesByReviewId.get(review.id)
    if (stored) {
      return {
        ...review,
        status: stored.status === "published" ? "responded" : review.status,
        responseStatus: stored.status as "draft" | "published",
        activeVersionId: stored.activeVersionId,
        versions: stored.versions,
      }
    }
    return { ...review, responseStatus: "none", activeVersionId: null, versions: [] }
  })

  const stats = computeReviewStats(reviews.map((r) => ({ rating: r.rating, sentiment: r.sentiment, platform: r.platform, hasResponse: r.responseStatus !== "none" })))

  return { reviews, stats }
}
