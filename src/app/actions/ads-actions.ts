"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { AdCampaign, AdCampaignStatus } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

export async function createCampaignAction(input: Omit<AdCampaign, "id" | "owner" | "createdAt" | "updatedAt">): Promise<ActionResult<{ id: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data, error } = await supabase
    .from("ad_campaigns")
    .insert({
      org_id: ctx.orgId, name: input.name, platform: input.platform, objective: input.objective, status: input.status,
      budget_daily: input.budgetDaily, start_date: input.startDate, end_date: input.endDate,
      target_audience: input.targetAudience || null, headline: input.headline || null, body: input.body || null,
      cta: input.cta || null, notes: input.notes || null, owner_id: ctx.userId, owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create campaign" }
  revalidatePath("/paid-ads")
  return { success: true, data: { id: data.id } }
}

export async function updateCampaignAction(id: string, patch: Partial<Omit<AdCampaign, "id" | "owner" | "createdAt" | "updatedAt">>): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.platform !== undefined) dbPatch.platform = patch.platform
  if (patch.objective !== undefined) dbPatch.objective = patch.objective
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.budgetDaily !== undefined) dbPatch.budget_daily = patch.budgetDaily
  if (patch.startDate !== undefined) dbPatch.start_date = patch.startDate
  if (patch.endDate !== undefined) dbPatch.end_date = patch.endDate
  if (patch.targetAudience !== undefined) dbPatch.target_audience = patch.targetAudience || null
  if (patch.headline !== undefined) dbPatch.headline = patch.headline || null
  if (patch.body !== undefined) dbPatch.body = patch.body || null
  if (patch.cta !== undefined) dbPatch.cta = patch.cta || null
  if (patch.notes !== undefined) dbPatch.notes = patch.notes || null

  const { error } = await supabase.from("ad_campaigns").update(dbPatch).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/paid-ads")
  return { success: true, data: undefined }
}

export async function updateCampaignStatusAction(id: string, status: AdCampaignStatus): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("ad_campaigns").update({ status }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/paid-ads")
  return { success: true, data: undefined }
}

export async function deleteCampaignAction(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("ad_campaigns").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/paid-ads")
  return { success: true, data: undefined }
}
