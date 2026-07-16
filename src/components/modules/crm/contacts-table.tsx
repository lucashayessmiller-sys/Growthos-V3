"use client"
import * as React from "react"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LeadScoreBadge } from "@/components/modules/crm/lead-score-badge"
import { ContactDialog } from "@/components/modules/crm/contact-dialog"
import { DealDialog } from "@/components/modules/crm/deal-dialog"
import { useCrmStore } from "@/store/crm-store"
import { computeLeadScore } from "@/engines/crm"
import type { Contact, Deal } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

const statusVariant = { lead: "secondary", qualified: "amber", customer: "growth", churned: "outline" } as const

export function ContactsTable({ contacts, deals }: { contacts: Contact[]; deals: Deal[] }) {
  const deleteContact = useCrmStore((s) => s.deleteContact)

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">Contact</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Lead score</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium text-right">Updated</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const { score } = computeLeadScore(c, deals)
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{c.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.name}</p>
                          <p className="text-xs text-muted truncate">{c.company || c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5"><Badge variant={statusVariant[c.status]} className="text-[10px] capitalize">{c.status}</Badge></td>
                    <td className="py-2.5 text-right"><LeadScoreBadge score={score} /></td>
                    <td className="py-2.5 text-muted text-xs">{c.source || "—"}</td>
                    <td className="py-2.5 text-right text-xs text-muted">{formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}</td>
                    <td className="py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <ContactDialog contact={c} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit contact</DropdownMenuItem>} />
                          <DealDialog contacts={contacts} defaultContactId={c.id} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Add deal</DropdownMenuItem>} />
                          <DropdownMenuItem onClick={() => deleteContact(c.id)} className="text-danger">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {contacts.length === 0 && <p className="py-8 text-center text-sm text-muted">No contacts yet — add your first one above.</p>}
      </CardContent>
    </Card>
  )
}
