import "server-only"
import type { AdCampaign } from "@/lib/types"
import { seedAdCampaigns } from "@/lib/demo-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"

interface AdCampaignRow {
  id: string; name: string; platform: string; objective: string; status: string
  budget_daily: string | number; start_date: string | null; end_date: string | null
  target_audience: string | null; headline: string | null; body: string | null; cta: string | null
  notes: string | null; owner_name: string | null; created_at: string; updated_at: string
}

function mapCampaign(row: AdCampaignRow): AdCampaign {
  return {
    id: row.id, name: row.name, platform: row.platform as AdCampaign["platform"], objective: row.objective as AdCampaign["objective"],
    status: row.status as AdCampaign["status"], budgetDaily: Number(row.budget_daily), startDate: row.start_date, endDate: row.end_date,
    targetAudience: row.target_audience ?? "", headline: row.headline ?? "", body: row.body ?? "", cta: row.cta ?? "",
    notes: row.notes ?? "", owner: row.owner_name ?? "Unknown", createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export async function getInitialCampaigns(): Promise<AdCampaign[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return seedAdCampaigns()

  const supabase = await createSupabaseServerClient()
  if (!supabase) return seedAdCampaigns()

  const { data, error } = await supabase.from("ad_campaigns").select("*").eq("org_id", ctx.orgId).order("updated_at", { ascending: false })
  if (error || !data) {
    console.error("[data/ads] query failed, falling back to demo data:", error)
    return seedAdCampaigns()
  }
  return (data as AdCampaignRow[]).map(mapCampaign)
}
