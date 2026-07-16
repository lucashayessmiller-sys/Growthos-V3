"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { CreativeDesign, DesignLayer } from "@/lib/types"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

export async function createDesignAction(input: { name: string; canvasWidth: number; canvasHeight: number; layers: DesignLayer[]; thumbnailDataUrl: string | null }): Promise<ActionResult<{ id: string }>> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !ctx.userId || !supabase) return { success: false, error: "Supabase not configured" }

  const { data, error } = await supabase
    .from("creative_designs")
    .insert({
      org_id: ctx.orgId, name: input.name, canvas_width: input.canvasWidth, canvas_height: input.canvasHeight,
      layers: input.layers, thumbnail_data_url: input.thumbnailDataUrl, owner_id: ctx.userId, owner_name: ctx.userName,
    })
    .select("id")
    .single()

  if (error || !data) return { success: false, error: error?.message ?? "Failed to save design" }
  revalidatePath("/creative-studio")
  return { success: true, data: { id: data.id } }
}

export async function updateDesignAction(id: string, patch: Partial<Pick<CreativeDesign, "name" | "layers" | "thumbnailDataUrl">>): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const dbPatch: Record<string, unknown> = {}
  if (patch.name !== undefined) dbPatch.name = patch.name
  if (patch.layers !== undefined) dbPatch.layers = patch.layers
  if (patch.thumbnailDataUrl !== undefined) dbPatch.thumbnail_data_url = patch.thumbnailDataUrl

  const { error } = await supabase.from("creative_designs").update(dbPatch).eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/creative-studio")
  return { success: true, data: undefined }
}

export async function deleteDesignAction(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }
  const { error } = await supabase.from("creative_designs").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath("/creative-studio")
  return { success: true, data: undefined }
}
