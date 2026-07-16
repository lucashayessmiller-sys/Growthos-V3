import "server-only"
import type { CreativeDesign } from "@/lib/types"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"

interface CreativeDesignRow {
  id: string; name: string; canvas_width: number; canvas_height: number
  layers: unknown; thumbnail_data_url: string | null; owner_name: string | null
  created_at: string; updated_at: string
}

function mapDesign(row: CreativeDesignRow): CreativeDesign {
  return {
    id: row.id, name: row.name, canvasWidth: row.canvas_width, canvasHeight: row.canvas_height,
    layers: (row.layers as CreativeDesign["layers"]) ?? [], thumbnailDataUrl: row.thumbnail_data_url,
    owner: row.owner_name ?? "Unknown", createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export async function getInitialDesigns(): Promise<CreativeDesign[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return []

  const supabase = await createSupabaseServerClient()
  if (!supabase) return []

  const { data, error } = await supabase.from("creative_designs").select("*").eq("org_id", ctx.orgId).order("updated_at", { ascending: false })
  if (error || !data) {
    if (error) console.error("[data/creative] query failed:", error)
    return []
  }
  return (data as CreativeDesignRow[]).map(mapDesign)
}
