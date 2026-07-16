import { getInitialContacts, getInitialDeals } from "@/lib/data/crm"
import { CrmClient } from "@/components/modules/crm/crm-client"

// Server Component fetch; unlike the last few modules, contacts and deals
// are fully real data — no external API dependency, no sample-data caveat.
// Persisted through Supabase when configured, local-only demo store otherwise.
export default async function CrmPage() {
  const contacts = await getInitialContacts()
  const deals = await getInitialDeals(contacts)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">CRM + Lead Engine</h1>
        <p className="text-sm text-muted mt-0.5">Pipeline, contacts, and AI lead scoring in one revenue workspace.</p>
      </div>
      <CrmClient initialContacts={contacts} initialDeals={deals} />
    </div>
  )
}
