"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contact, Deal, DealStage } from "@/lib/types"
import { useCrmStore } from "@/store/crm-store"

const STAGES: DealStage[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"]
const DEFAULT_PROBABILITY: Record<DealStage, number> = { new: 15, qualified: 35, proposal: 60, negotiation: 75, won: 100, lost: 0 }

function emptyForm(contactId?: string) {
  return { contactId: contactId ?? null, title: "", value: 0, stage: "new" as DealStage, probability: 15, expectedCloseDate: "", notes: "" }
}

export function DealDialog({ deal, contacts, defaultContactId, trigger }: { deal?: Deal; contacts: Contact[]; defaultContactId?: string; trigger?: React.ReactNode }) {
  const createDeal = useCrmStore((s) => s.createDeal)
  const updateDeal = useCrmStore((s) => s.updateDeal)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(deal ? { ...deal, expectedCloseDate: deal.expectedCloseDate ?? "" } : emptyForm(defaultContactId))
  const [loading, setLoading] = React.useState(false)

  function handleOpenChange(next: boolean) {
    if (next) setForm(deal ? { ...deal, expectedCloseDate: deal.expectedCloseDate ?? "" } : emptyForm(defaultContactId))
    setOpen(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Deal title is required")
      return
    }
    setLoading(true)
    try {
      const payload = { ...form, expectedCloseDate: form.expectedCloseDate || null }
      if (deal) {
        updateDeal(deal.id, payload)
        toast.success("Deal updated")
      } else {
        await createDeal(payload)
        toast.success("Deal added")
      }
      setOpen(false)
    } catch {
      toast.error("Something went wrong — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm"><Plus className="h-4 w-4" /> Add deal</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit deal" : "Add deal"}</DialogTitle>
          <DialogDescription>Track pipeline value and stage for this opportunity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Deal title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Contact</Label>
            <Select value={form.contactId ?? "none"} onValueChange={(v) => setForm({ ...form, contactId: v === "none" ? null : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No contact linked</SelectItem>
                {contacts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Value ($)</Label>
              <Input type="number" min={0} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as DealStage, probability: DEFAULT_PROBABILITY[v as DealStage] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Probability (%)</Label>
              <Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Expected close</Label>
              <Input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {deal ? "Save changes" : "Add deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
