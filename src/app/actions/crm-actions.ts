"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { Contact, ContactStatus, Deal, DealStage } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

export async function createContactAction(input: Omit<Contact, "id" | "owner" | "createdAt" | "updatedAt">): Promise<ActionResult<{ id: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      org_id: ctx.orgId, name: input.name, email: input.email || null, phone: input.phone || null,
      company: input.company || null, status: input.status, source: input.source || null,
      tags: input.tags, notes: input.notes || null, owner_id: ctx.userId, owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create contact" }
  revalidatePath("/crm")
  return { success: true, data: { id: data.id } }
}

export async function updateContactAction(id: string, patch: Partial<Omit<Contact, "id" | "owner" | "createdAt" | "updatedAt">>): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.email !== undefined) dbPatch.email = patch.email || null
  if (patch.phone !== undefined) dbPatch.phone = patch.phone || null
  if (patch.company !== undefined) dbPatch.company = patch.company || null
  if (patch.status !== undefined) dbPatch.status = patch.status
  if (patch.source !== undefined) dbPatch.source = patch.source || null
  if (patch.tags !== undefined) dbPatch.tags = patch.tags
  if (patch.notes !== undefined) dbPatch.notes = patch.notes || null

  const { error } = await supabase.from("contacts").update(dbPatch).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/crm")
  return { success: true, data: undefined }
}

export async function updateContactStatusAction(id: string, status: ContactStatus): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("contacts").update({ status }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/crm")
  return { success: true, data: undefined }
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("contacts").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/crm")
  return { success: true, data: undefined }
}

export async function createDealAction(input: Omit<Deal, "id" | "owner" | "createdAt" | "updatedAt">): Promise<ActionResult<{ id: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      org_id: ctx.orgId, contact_id: input.contactId, title: input.title, value: input.value, stage: input.stage,
      probability: input.probability, expected_close_date: input.expectedCloseDate, notes: input.notes || null,
      owner_id: ctx.userId, owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to create deal" }
  revalidatePath("/crm")
  return { success: true, data: { id: data.id } }
}

export async function updateDealStageAction(id: string, stage: DealStage, probability: number): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("deals").update({ stage, probability }).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/crm")
  return { success: true, data: undefined }
}

export async function updateDealAction(id: string, patch: Partial<Omit<Deal, "id" | "owner" | "createdAt" | "updatedAt">>): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const dbPatch: Record<string, unknown> = {}
  if (patch.title !== undefined) dbPatch.title = patch.title
  if (patch.value !== undefined) dbPatch.value = patch.value
  if (patch.stage !== undefined) dbPatch.stage = patch.stage
  if (patch.probability !== undefined) dbPatch.probability = patch.probability
  if (patch.expectedCloseDate !== undefined) dbPatch.expected_close_date = patch.expectedCloseDate
  if (patch.notes !== undefined) dbPatch.notes = patch.notes || null
  if (patch.contactId !== undefined) dbPatch.contact_id = patch.contactId

  const { error } = await supabase.from("deals").update(dbPatch).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/crm")
  return { success: true, data: undefined }
}

export async function deleteDealAction(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("deals").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/crm")
  return { success: true, data: undefined }
}
