import "server-only"
import { getInitialContentItems } from "@/lib/data/content"
import { getInitialSocialPosts } from "@/lib/data/social"
import { getCurrentOrgContext } from "@/lib/data/org"
import { buildSnapshot, type AnalyticsSnapshot } from "@/engines/analytics"

// Analytics AI's data seam is a composition, not a new query — it reuses
// Content Factory's and Social Media Manager's existing data fetchers
// (each already Supabase-or-demo aware) and runs everything through the
// deterministic analytics engine. This is exactly the "shared engines,
// no duplicated queries" principle: no new AI calls, no new tables needed
// for this milestone.
export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  const [ctx, pieces, posts] = await Promise.all([
    getCurrentOrgContext(),
    getInitialContentItems(),
    getInitialSocialPosts(),
  ])

  return buildSnapshot(ctx?.orgId ?? "demo-org", pieces, posts)
}
