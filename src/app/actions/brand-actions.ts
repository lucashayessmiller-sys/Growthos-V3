"use server"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import type { BrandKit } from "@/lib/types"

type ActionResult = { success: true } | { success: false; error: string }

export async function updateBrandKitAction(brandKit: BrandKit): Promise<ActionResult> {
  const ctx = await getCurrentOrgContext()
  const supabase = await createSupabaseServerClient()
  if (!ctx || !supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.from("organizations").update({ brand_voice: brandKit }).eq("id", ctx.orgId)
  if (error) return { success: false, error: error.message }

  revalidatePath("/brand-guardian")
  return { success: true }
}
