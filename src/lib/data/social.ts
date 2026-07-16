import "server-only"
import type { SocialPost } from "@/lib/types"
import { seedSocialPosts } from "@/lib/demo-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import { mapRowToSocialPost, type ContentItemRow } from "@/lib/data/mappers"

// Same seam pattern as lib/data/content.ts — see that file for the rationale.
export async function getInitialSocialPosts(): Promise<SocialPost[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return seedSocialPosts()

  const supabase = await createSupabaseServerClient()
  if (!supabase) return seedSocialPosts()

  const { data, error } = await supabase
    .from("content_items")
    .select("*, content_versions(*)")
    .eq("org_id", ctx.orgId)
    .eq("type", "social-post")
    .order("updated_at", { ascending: false })

  if (error || !data) {
    console.error("[data/social] query failed, falling back to demo data:", error)
    return seedSocialPosts()
  }

  return (data as ContentItemRow[]).map(mapRowToSocialPost)
}
