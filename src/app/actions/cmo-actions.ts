"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

export async function createCmoBriefAction(body: string): Promise<ActionResult<{ id: string; versionId: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data: item, error: itemError } = await supabase
    .from("content_items")
    .insert({
      org_id: ctx.orgId, type: "cmo-brief", title: "Weekly strategic brief", status: "draft",
      brief: {}, owner_id: ctx.userId, owner_name: ctx.userName,
    })
    .select("id")
    .single()
  if (itemError || !item) return { success: false, error: itemError?.message ?? "Failed to create brief" }

  const { data: version, error: versionError } = await supabase
    .from("content_versions")
    .insert({ content_id: item.id, body, note: "Initial AI-generated brief", generated_by: "ai" })
    .select("id")
    .single()
  if (versionError || !version) return { success: false, error: versionError?.message ?? "Failed to create version" }

  await supabase.from("content_items").update({ active_version_id: version.id }).eq("id", item.id)
  revalidatePath("/ai-cmo")
  return { success: true, data: { id: item.id, versionId: version.id } }
}

export async function addCmoBriefVersionAction(briefId: string, body: string, note: string, generatedBy: "ai" | "human"): Promise<ActionResult<{ versionId: string }>> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { data: version, error } = await supabase
    .from("content_versions")
    .insert({ content_id: briefId, body, note, generated_by: generatedBy })
    .select("id")
    .single()
  if (error || !version) return { success: false, error: error?.message ?? "Failed to add version" }

  // Regenerating or editing moves the brief back to draft — it needs
  // re-approval, same as any other approve-then-edit workflow in the app.
  await supabase.from("content_items").update({ active_version_id: version.id, status: "draft" }).eq("id", briefId)
  revalidatePath("/ai-cmo")
  return { success: true, data: { versionId: version.id } }
}

export async function updateCmoBriefStatusAction(briefId: string, status: "draft" | "approved"): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("content_items").update({ status }).eq("id", briefId)
  if (error) return { success: false, error: error.message }
  revalidatePath("/ai-cmo")
  return { success: true, data: undefined }
}
