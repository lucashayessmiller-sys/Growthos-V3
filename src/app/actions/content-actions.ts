"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { ContentBrief, ContentStatus } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

// Every write in Content Factory routes through one of these Server
// Actions rather than a client component talking to Supabase directly —
// keeps RLS-relevant org/user resolution, revalidation, and error handling
// in one place. No-ops with a clear error when Supabase isn't configured;
// callers (the zustand store) treat that as "demo mode, stay local-only."

export async function createContentPieceAction(
  brief: ContentBrief,
  body: string,
  seoScore: number,
  readabilityScore: number
): Promise<ActionResult<{ id: string; versionId: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data: item, error: itemError } = await supabase
    .from("content_items")
    .insert({
      org_id: ctx.orgId,
      type: brief.type,
      title: brief.topic,
      status: "draft",
      brief,
      metadata: { seoScore, readabilityScore },
      campaign: "Unassigned",
      owner_id: ctx.userId,
      owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (itemError || !item) return { success: false, error: itemError?.message ?? "Failed to create content item" }

  const { data: version, error: versionError } = await supabase
    .from("content_versions")
    .insert({ content_id: item.id, body, note: "Initial AI draft", generated_by: "ai" })
    .select("id")
    .single()

  if (versionError || !version) return { success: false, error: versionError?.message ?? "Failed to create version" }

  await supabase.from("content_items").update({ active_version_id: version.id }).eq("id", item.id)

  revalidatePath("/content-factory")
  return { success: true, data: { id: item.id, versionId: version.id } }
}

export async function addContentVersionAction(
  pieceId: string,
  body: string,
  note: string,
  generatedBy: "ai" | "human",
  seoScore: number,
  readabilityScore: number
): Promise<ActionResult<{ versionId: string }>> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { data: version, error: versionError } = await supabase
    .from("content_versions")
    .insert({ content_id: pieceId, body, note, generated_by: generatedBy })
    .select("id")
    .single()

  if (versionError || !version) return { success: false, error: versionError?.message ?? "Failed to add version" }

  const { data: current } = await supabase.from("content_items").select("metadata").eq("id", pieceId).single()
  const metadata = { ...(current?.metadata ?? {}), seoScore, readabilityScore }

  await supabase.from("content_items").update({ active_version_id: version.id, metadata }).eq("id", pieceId)

  revalidatePath("/content-factory")
  revalidatePath(`/content-factory/${pieceId}`)
  return { success: true, data: { versionId: version.id } }
}

export async function setActiveContentVersionAction(pieceId: string, versionId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").update({ active_version_id: versionId }).eq("id", pieceId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/content-factory/${pieceId}`)
  return { success: true, data: undefined }
}

export async function updateContentStatusAction(pieceId: string, status: ContentStatus): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").update({ status }).eq("id", pieceId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/content-factory")
  revalidatePath(`/content-factory/${pieceId}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function updateContentBriefAction(pieceId: string, brief: ContentBrief): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").update({ brief, title: brief.topic }).eq("id", pieceId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/content-factory/${pieceId}`)
  return { success: true, data: undefined }
}

export async function editContentVersionBodyAction(
  versionId: string,
  pieceId: string,
  body: string,
  seoScore: number,
  readabilityScore: number
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error: versionError } = await supabase
    .from("content_versions")
    .update({ body, generated_by: "human" })
    .eq("id", versionId)
  if (versionError) return { success: false, error: versionError.message }

  const { data: current } = await supabase.from("content_items").select("metadata").eq("id", pieceId).single()
  const metadata = { ...(current?.metadata ?? {}), seoScore, readabilityScore }
  await supabase.from("content_items").update({ metadata }).eq("id", pieceId)

  revalidatePath(`/content-factory/${pieceId}`)
  return { success: true, data: undefined }
}

export async function removeContentPieceAction(pieceId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").delete().eq("id", pieceId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/content-factory")
  return { success: true, data: undefined }
}
