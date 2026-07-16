import "server-only"
import type { ContentPiece } from "@/lib/types"
import { seedContentPieces } from "@/lib/demo-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import { mapRowToContentPiece, type ContentItemRow } from "@/lib/data/mappers"

// Data-access seam for Content Factory. Server Components call this
// directly to render the first paint on the server. Falls back to
// deterministic demo data whenever Supabase isn't configured or the
// caller has no resolvable org (e.g. signed out) — so the module never
// hard-fails, it just degrades to the demo experience.
export async function getInitialContentItems(): Promise<ContentPiece[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return seedContentPieces()

  const supabase = await createSupabaseServerClient()
  if (!supabase) return seedContentPieces()

  // Content Factory items only — several other modules (Social Media
  // Manager, Reputation Manager, AI CMO) reuse this same table under
  // different `type` values; excluded here so this list stays scoped.
  const { data, error } = await supabase
    .from("content_items")
    .select("*, content_versions(*)")
    .eq("org_id", ctx.orgId)
    .not("type", "in", "(social-post,review-response,cmo-brief)")
    .order("updated_at", { ascending: false })

  if (error || !data) {
    console.error("[data/content] query failed, falling back to demo data:", error)
    return seedContentPieces()
  }

  return (data as ContentItemRow[]).map(mapRowToContentPiece)
}
