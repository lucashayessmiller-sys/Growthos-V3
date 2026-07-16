"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { SocialBrief, SocialStatus } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

export async function createSocialPostAction(
  brief: SocialBrief,
  caption: string,
  hashtags: string[]
): Promise<ActionResult<{ id: string; versionId: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data: item, error: itemError } = await supabase
    .from("content_items")
    .insert({
      org_id: ctx.orgId,
      type: "social-post",
      title: brief.topic,
      status: "draft",
      brief,
      metadata: { platform: brief.platform, mediaType: brief.mediaType },
      campaign: "Unassigned",
      owner_id: ctx.userId,
      owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (itemError || !item) return { success: false, error: itemError?.message ?? "Failed to create post" }

  const { data: version, error: versionError } = await supabase
    .from("content_versions")
    .insert({ content_id: item.id, body: caption, metadata: { hashtags }, note: "Initial AI draft", generated_by: "ai" })
    .select("id")
    .single()

  if (versionError || !version) return { success: false, error: versionError?.message ?? "Failed to create version" }

  await supabase.from("content_items").update({ active_version_id: version.id }).eq("id", item.id)

  revalidatePath("/social-media")
  return { success: true, data: { id: item.id, versionId: version.id } }
}

export async function addSocialVersionAction(
  postId: string,
  caption: string,
  hashtags: string[],
  note: string,
  generatedBy: "ai" | "human"
): Promise<ActionResult<{ versionId: string }>> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { data: version, error: versionError } = await supabase
    .from("content_versions")
    .insert({ content_id: postId, body: caption, metadata: { hashtags }, note, generated_by: generatedBy })
    .select("id")
    .single()

  if (versionError || !version) return { success: false, error: versionError?.message ?? "Failed to add version" }

  await supabase.from("content_items").update({ active_version_id: version.id }).eq("id", postId)

  revalidatePath("/social-media")
  revalidatePath(`/social-media/${postId}`)
  return { success: true, data: { versionId: version.id } }
}

export async function setActiveSocialVersionAction(postId: string, versionId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").update({ active_version_id: versionId }).eq("id", postId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/social-media/${postId}`)
  return { success: true, data: undefined }
}

export async function updateSocialStatusAction(postId: string, status: SocialStatus): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const patch: Record<string, unknown> = { status }

  if (status === "published") {
    patch.published_at = new Date().toISOString()
    const { data: current } = await supabase.from("content_items").select("metadata").eq("id", postId).single()
    const metadata = current?.metadata as Record<string, unknown> | undefined
    if (!metadata?.engagement) {
      patch.metadata = {
        ...metadata,
        engagement: {
          likes: Math.floor(80 + Math.random() * 900),
          comments: Math.floor(2 + Math.random() * 60),
          shares: Math.floor(1 + Math.random() * 40),
          reach: Math.floor(1200 + Math.random() * 9000),
          saves: Math.floor(0 + Math.random() * 120),
        },
      }
    }
  }

  const { error } = await supabase.from("content_items").update(patch).eq("id", postId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/social-media")
  revalidatePath(`/social-media/${postId}`)
  revalidatePath("/dashboard")
  return { success: true, data: undefined }
}

export async function updateSocialBriefAction(postId: string, brief: SocialBrief): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { data: current } = await supabase.from("content_items").select("metadata").eq("id", postId).single()
  const metadata = { ...(current?.metadata ?? {}), platform: brief.platform, mediaType: brief.mediaType }

  const { error } = await supabase
    .from("content_items")
    .update({ brief, title: brief.topic, metadata })
    .eq("id", postId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/social-media/${postId}`)
  return { success: true, data: undefined }
}

export async function editSocialVersionCaptionAction(versionId: string, postId: string, caption: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_versions").update({ body: caption, generated_by: "human" }).eq("id", versionId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/social-media/${postId}`)
  return { success: true, data: undefined }
}

export async function scheduleSocialPostAction(postId: string, isoDate: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase
    .from("content_items")
    .update({ status: "scheduled", scheduled_for: isoDate })
    .eq("id", postId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/social-media")
  revalidatePath(`/social-media/${postId}`)
  return { success: true, data: undefined }
}

export async function removeSocialPostAction(postId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").delete().eq("id", postId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/social-media")
  return { success: true, data: undefined }
}
