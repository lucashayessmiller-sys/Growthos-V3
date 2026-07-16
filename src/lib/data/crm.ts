import "server-only"
import type { Contact, Deal } from "@/lib/types"
import { seedContacts, seedDeals } from "@/lib/demo-data"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentOrgContext } from "@/lib/data/org"

interface ContactRow {
  id: string; name: string; email: string | null; phone: string | null; company: string | null
  status: string; source: string | null; tags: string[]; notes: string | null
  owner_name: string | null; created_at: string; updated_at: string
}
interface DealRow {
  id: string; contact_id: string | null; title: string; value: string | number; stage: string
  probability: number; expected_close_date: string | null; notes: string | null
  owner_name: string | null; created_at: string; updated_at: string
}

function mapContact(row: ContactRow): Contact {
  return {
    id: row.id, name: row.name, email: row.email ?? "", phone: row.phone ?? "", company: row.company ?? "",
    status: row.status as Contact["status"], source: row.source ?? "", tags: row.tags ?? [], notes: row.notes ?? "",
    owner: row.owner_name ?? "Unknown", createdAt: row.created_at, updatedAt: row.updated_at,
  }
}
function mapDeal(row: DealRow): Deal {
  return {
    id: row.id, contactId: row.contact_id, title: row.title, value: Number(row.value), stage: row.stage as Deal["stage"],
    probability: row.probability, expectedCloseDate: row.expected_close_date, notes: row.notes ?? "",
    owner: row.owner_name ?? "Unknown", createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

export async function getInitialContacts(): Promise<Contact[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return seedContacts()

  const supabase = await createSupabaseServerClient()
  if (!supabase) return seedContacts()

  const { data, error } = await supabase.from("contacts").select("*").eq("org_id", ctx.orgId).order("updated_at", { ascending: false })
  if (error || !data) {
    console.error("[data/crm] contacts query failed, falling back to demo data:", error)
    return seedContacts()
  }
  return (data as ContactRow[]).map(mapContact)
}

export async function getInitialDeals(contacts: Contact[]): Promise<Deal[]> {
  const ctx = await getCurrentOrgContext()
  if (!ctx) return seedDeals(contacts)

  const supabase = await createSupabaseServerClient()
  if (!supabase) return seedDeals(contacts)

  const { data, error } = await supabase.from("deals").select("*").eq("org_id", ctx.orgId).order("updated_at", { ascending: false })
  if (error || !data) {
    console.error("[data/crm] deals query failed, falling back to demo data:", error)
    return seedDeals(contacts)
  }
  return (data as DealRow[]).map(mapDeal)
}
