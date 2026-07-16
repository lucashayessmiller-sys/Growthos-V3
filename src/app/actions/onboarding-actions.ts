"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string }

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "workspace"
}

// Bootstraps a brand-new workspace for the just-signed-up user via the
// create_organization_with_owner() Postgres function (SECURITY DEFINER —
// see supabase/schema.sql for why this can't be two plain inserts under RLS).
export async function createOrganizationAction(name: string, industry: string): Promise<ActionResult<{ orgId: string }>> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not signed in" }

  const { data, error } = await supabase.rpc("create_organization_with_owner", {
    org_name: name,
    org_slug: `${slugify(name)}-${user.id.slice(0, 6)}`,
    org_industry: industry,
  })

  if (error) return { success: false, error: error.message }
  return { success: true, data: { orgId: data as string } }
}
