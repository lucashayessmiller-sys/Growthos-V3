"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { Review } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

// Responses reuse content_items/content_versions (type = 'review-response')
// rather than a bespoke table — see lib/data/reputation.ts for why.

export async function createReviewResponseAction(review: Review, body: string): Promise<ActionResult<{ id: string; versionId: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data: item, error: itemError } = await supabase
    .from("content_items")
    .insert({
      org_id: ctx.orgId,
      type: "review-response",
      title: `Reply to ${review.authorName} (${review.platform})`,
      status: "draft",
      brief: { reviewId: review.id, platform: review.platform, authorName: review.authorName, rating: review.rating, reviewText: review.text },
      campaign: "Reputation",
      owner_id: ctx.userId,
      owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (itemError || !item) return { success: false, error: itemError?.message ?? "Failed to create response" }

  const { data: version, error: versionError } = await supabase
    .from("content_versions")
    .insert({ content_id: item.id, body, note: "Initial AI draft", generated_by: "ai" })
    .select("id")
    .single()

  if (versionError || !version) return { success: false, error: versionError?.message ?? "Failed to create version" }

  await supabase.from("content_items").update({ active_version_id: version.id }).eq("id", item.id)

  revalidatePath("/reputation")
  return { success: true, data: { id: item.id, versionId: version.id } }
}

export async function addReviewResponseVersionAction(
  responseId: string,
  body: string,
  note: string,
  generatedBy: "ai" | "human"
): Promise<ActionResult<{ versionId: string }>> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { data: version, error } = await supabase
    .from("content_versions")
    .insert({ content_id: responseId, body, note, generated_by: generatedBy })
    .select("id")
    .single()

  if (error || !version) return { success: false, error: error?.message ?? "Failed to add version" }

  await supabase.from("content_items").update({ active_version_id: version.id }).eq("id", responseId)
  revalidatePath("/reputation")
  return { success: true, data: { versionId: version.id } }
}

export async function publishReviewResponseAction(responseId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("content_items").update({ status: "published" }).eq("id", responseId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/reputation")
  return { success: true, data: undefined }
}
