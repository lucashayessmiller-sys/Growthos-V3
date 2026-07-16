"use client"
import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CrmKpiCards } from "@/components/modules/crm/kpi-cards"
import { ContactsTable } from "@/components/modules/crm/contacts-table"
import { PipelineBoard } from "@/components/modules/crm/pipeline-board"
import { ContactDialog } from "@/components/modules/crm/contact-dialog"
import { DealDialog } from "@/components/modules/crm/deal-dialog"
import { useCrmStore } from "@/store/crm-store"
import { computePipelineStats } from "@/engines/crm"
import type { Contact, Deal } from "@/lib/types"

export function CrmClient({ initialContacts, initialDeals }: { initialContacts: Contact[]; initialDeals: Deal[] }) {
  const contacts = useCrmStore((s) => s.contacts)
  const deals = useCrmStore((s) => s.deals)
  const hydrated = useCrmStore((s) => s.hydrated)
  const hydrate = useCrmStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialContacts, initialDeals) }, [hydrate, initialContacts, initialDeals])

  const sourceContacts = hydrated ? contacts : initialContacts
  const sourceDeals = hydrated ? deals : initialDeals
  const stats = computePipelineStats(sourceDeals)

  return (
    <>
      <CrmKpiCards contactCount={sourceContacts.length} stats={stats} />

      <Tabs defaultValue="pipeline" className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <ContactDialog />
            <DealDialog contacts={sourceContacts} />
          </div>
        </div>

        <TabsContent value="pipeline">
          <PipelineBoard deals={sourceDeals} contacts={sourceContacts} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTable contacts={sourceContacts} deals={sourceDeals} />
        </TabsContent>
      </Tabs>
    </>
  )
}
