"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { Location } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

export async function createLocationAction(input: Omit<Location, "id" | "createdAt" | "updatedAt">): Promise<ActionResult<{ id: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !supabase) return { success: false, error: "Supabase not configured" }

  const { data, error } = await supabase
    .from("locations")
    .insert({
      org_id: ctx.orgId, name: input.name, address: input.address || null, city: input.city || null,
      region: input.region || null, postal_code: input.postalCode || null, phone: input.phone || null,
      hours: input.hours || null, status: input.status, description: input.description || null,
    })
    .select("id")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create location" }
  revalidatePath("/local-marketing")
  return { success: true, data: { id: data.id } }
}

export async function updateLocationAction(id: string, patch: Partial<Omit<Location, "id" | "createdAt" | "updatedAt">>): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.address !== undefined) dbPatch.address = patch.address || null
  if (patch.city !== undefined) dbPatch.city = patch.city || null
  if (patch.region !== undefined) dbPatch.region = patch.region || null
  if (patch.postalCode !== undefined) dbPatch.postal_code = patch.postalCode || null
  if (patch.phone !== undefined) dbPatch.phone = patch.phone || null
  if (patch.hours !== undefined) dbPatch.hours = patch.hours || null
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.description !== undefined) dbPatch.description = patch.description || null

  const { error } = await supabase.from("locations").update(dbPatch).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/local-marketing")
  return { success: true, data: undefined }
}

export async function deleteLocationAction(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("locations").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/local-marketing")
  return { success: true, data: undefined }
}
