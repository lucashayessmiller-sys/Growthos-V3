"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AdCampaign, AdObjective, AdPlatform } from "@/lib/types"
import { useAdsStore } from "@/store/ads-store"
import { generateAdCopy } from "@/lib/ai/ads-generate"
import { AD_PLATFORMS } from "@/lib/ad-platforms"

const OBJECTIVES: AdObjective[] = ["awareness", "traffic", "conversions", "leads"]

const empty: Omit<AdCampaign, "id" | "owner" | "createdAt" | "updatedAt"> = {
  name: "", platform: "meta", objective: "traffic", status: "draft", budgetDaily: 25, startDate: null, endDate: null,
  targetAudience: "", headline: "", body: "", cta: "", notes: "",
}

export function CampaignDialog({ campaign, trigger }: { campaign?: AdCampaign; trigger?: React.ReactNode }) {
  const createCampaign = useAdsStore((s) => s.createCampaign)
  const updateCampaign = useAdsStore((s) => s.updateCampaign)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(campaign ?? empty)
  const [loading, setLoading] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)

  function handleOpenChange(next: boolean) {
    if (next) setForm(campaign ?? empty)
    setOpen(next)
  }

  async function handleGenerateCopy() {
    if (!form.name.trim()) {
      toast.error("Give the campaign a name first")
      return
    }
    setGenerating(true)
    try {
      const copy = await generateAdCopy({ name: form.name, platform: form.platform, objective: form.objective, targetAudience: form.targetAudience })
      setForm({ ...form, ...copy })
      toast.success("Ad copy generated")
    } catch {
      toast.error("Couldn't generate copy — please try again")
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Campaign name is required")
      return
    }
    setLoading(true)
    try {
      if (campaign) {
        updateCampaign(campaign.id, form)
        toast.success("Campaign updated")
      } else {
        await createCampaign(form)
        toast.success("Campaign created")
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
        {trigger ?? <Button size="sm"><Plus className="h-4 w-4" /> New campaign</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit campaign" : "New campaign"}</DialogTitle>
          <DialogDescription>Performance simulation begins once a campaign is marked active.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Campaign name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as AdPlatform })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(AD_PLATFORMS).map(([k, p]) => <SelectItem key={k} value={k}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Objective</Label>
              <Select value={form.objective} onValueChange={(v) => setForm({ ...form, objective: v as AdObjective })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OBJECTIVES.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Daily budget ($)</Label>
              <Input type="number" min={1} value={form.budgetDaily} onChange={(e) => setForm({ ...form, budgetDaily: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Start date</Label>
              <Input type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value || null })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Target audience</Label>
            <Input value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} placeholder="e.g. lookalike audience, 24-40" />
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-muted">Ad copy</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={handleGenerateCopy} disabled={generating}>
                {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Generate with AI
              </Button>
            </div>
            <div className="space-y-2">
              <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline" />
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body text" rows={2} />
              <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="CTA (e.g. Shop Now)" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {campaign ? "Save changes" : "Create campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
