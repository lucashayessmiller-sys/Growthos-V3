import "server-only"
import { getCurrentOrgContext } from "@/lib/data/org"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DEFAULT_BRAND_KIT } from "@/engines/brand"
import type { BrandKit } from "@/lib/types"

// The brand kit itself lives in organizations.brand_voice (jsonb) — reusing
// the column already added for onboarding rather than a new table.
//
// Note: the compliance SCAN is intentionally NOT computed here. It's pure,
// deterministic, client-safe logic (engines/brand — no "server-only"
// marker), so the client boundary recomputes it reactively from whatever
// brand kit is currently in the store. That's what makes editing the brand
// kit in demo mode (no Supabase, so nothing to re-fetch from) immediately
// reflect in the scan results — see BrandGuardianClient.
export async function getBrandKit(): Promise<BrandKit> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return DEFAULT_BRAND_KIT

  const supabase = await createSupabaseServerClient()
  if (!supabase) return DEFAULT_BRAND_KIT

  const { data } = await supabase.from("organizations").select("brand_voice").eq("id", ctx.orgId).maybeSingle()
  const stored = data?.brand_voice as Partial<BrandKit> | undefined
  if (!stored || Object.keys(stored).length === 0) return DEFAULT_BRAND_KIT

  return { ...DEFAULT_BRAND_KIT, ...stored }
}
