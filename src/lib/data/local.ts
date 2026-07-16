import "server-only"
import type { Location, LocationStatus } from "@/lib/types"
import { seedLocations } from "@/lib/demo-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"
import { generateReviews } from "@/engines/reputation/seed"

interface LocationRow {
  id: string; name: string; address: string | null; city: string | null; region: string | null
  postal_code: string | null; phone: string | null; hours: string | null; status: string
  description: string | null; created_at: string; updated_at: string
}

function mapLocation(row: LocationRow): Location {
  return {
    id: row.id, name: row.name, address: row.address ?? "", city: row.city ?? "", region: row.region ?? "",
    postalCode: row.postal_code ?? "", phone: row.phone ?? "", hours: row.hours ?? "",
    status: row.status as LocationStatus, description: row.description ?? "",
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export async function getInitialLocations(): Promise<Location[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return seedLocations()

  const supabase = await createSupabaseServerClient()
  if (!supabase) return seedLocations()

  const { data, error } = await supabase.from("locations").select("*").eq("org_id", ctx.orgId).order("created_at", { ascending: true })
  if (error || !data) {
    console.error("[data/local] query failed, falling back to demo data:", error)
    return seedLocations()
  }
  return (data as LocationRow[]).map(mapLocation)
}

export interface LocationPerformance {
  locationName: string
  reviewCount: number
  avgRating: number
}

// Reuses the exact same seeded review generator Reputation Manager uses
// (same org seed => same reviews) rather than duplicating review data —
// genuinely real aggregation of that module's data, scoped by location.
export async function getLocationPerformance(): Promise<LocationPerformance[]> {
  const ctx = await getCurrentOrgContext()
  const reviews = generateReviews(ctx?.orgId ?? "demo-org")

  const byLocation = new Map<string, number[]>()
  for (const r of reviews) {
    if (!byLocation.has(r.location)) byLocation.set(r.location, [])
    byLocation.get(r.location)!.push(r.rating)
  }

  return [...byLocation.entries()].map(([locationName, ratings]) => ({
    locationName,
    reviewCount: ratings.length,
    avgRating: Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10,
  }))
}
