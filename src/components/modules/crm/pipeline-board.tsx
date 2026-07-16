"use client"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DealDialog } from "@/components/modules/crm/deal-dialog"
import { useCrmStore } from "@/store/crm-store"
import type { Contact, Deal, DealStage } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const STAGES: { value: DealStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]
const DEFAULT_PROBABILITY: Record<DealStage, number> = { new: 15, qualified: 35, proposal: 60, negotiation: 75, won: 100, lost: 0 }
const NEXT_STAGE: Partial<Record<DealStage, DealStage>> = { new: "qualified", qualified: "proposal", proposal: "negotiation", negotiation: "won" }

export function PipelineBoard({ deals, contacts }: { deals: Deal[]; contacts: Contact[] }) {
  const updateDealStage = useCrmStore((s) => s.updateDealStage)
  const deleteDeal = useCrmStore((s) => s.deleteDeal)

  return (
    <div className="grid grid-cols-2 gap-3 overflow-x-auto lg:grid-cols-6">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.value)
        const stageValue = stageDeals.reduce((s, d) => s + d.value, 0)
        return (
          <div key={stage.value} className="min-w-[200px]">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold">{stage.label}</p>
              <span className="text-[10px] text-muted">{formatCurrency(stageValue)}</span>
            </div>
            <div className="space-y-2">
              {stageDeals.map((deal) => {
                const contact = contacts.find((c) => c.id === deal.contactId)
                const next = NEXT_STAGE[deal.stage]
                return (
                  <Card key={deal.id} className="p-3">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-medium leading-snug">{deal.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DealDialog deal={deal} contacts={contacts} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit deal</DropdownMenuItem>} />
                          <DropdownMenuItem onClick={() => deleteDeal(deal.id)} className="text-danger">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {contact && <p className="mt-1 text-[11px] text-muted truncate">{contact.name}</p>}
                    <p className="mt-1.5 font-mono-data text-sm font-semibold">{formatCurrency(deal.value)}</p>
                    <Badge variant="outline" className="mt-1.5 text-[10px]">{deal.probability}% probability</Badge>
                    {next && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2 h-6 w-full text-[10px]"
                        onClick={() => updateDealStage(deal.id, next, DEFAULT_PROBABILITY[next])}
                      >
                        Move to {STAGES.find((s) => s.value === next)?.label} →
                      </Button>
                    )}
                  </Card>
                )
              })}
              {stageDeals.length === 0 && <div className="rounded-lg border border-dashed border-border py-6 text-center text-[11px] text-muted">Empty</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
