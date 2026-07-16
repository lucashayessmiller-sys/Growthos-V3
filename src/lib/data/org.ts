import "server-only"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { DEMO_ORG } from "@/lib/demo-data"

export interface CurrentOrgContext {
  orgId: string
  orgName: string
  userId: string | null
  userName: string
  role: "Owner" | "Admin" | "Editor" | "Contributor" | "Viewer"
}

// Every module's data layer calls this to know which org to scope queries
// to. Demo mode returns the seeded demo org with no auth required — this is
// what keeps the whole app usable with zero configuration.
export async function getCurrentOrgContext(): Promise<CurrentOrgContext | null> {
  if (!isSupabaseConfigured()) {
    return { orgId: DEMO_ORG.id, orgName: DEMO_ORG.name, userId: null, userName: "Demo user", role: "Owner" }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role, organizations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) return null

  const orgName = (membership.organizations as unknown as { name: string } | null)?.name ?? "Workspace"

  return {
    orgId: membership.org_id,
    orgName,
    userId: user.id,
    userName: user.user_metadata?.name ?? user.email ?? "You",
    role: membership.role as CurrentOrgContext["role"],
  }
}
