"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import type { BrandKit } from "@/lib/types"
import { useBrandStore } from "@/store/brand-store"

export function BrandKitDialog({ brandKit }: { brandKit: BrandKit }) {
  const updateBrandKit = useBrandStore((s) => s.updateBrandKit)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(brandKit)
  const [bannedInput, setBannedInput] = React.useState("")
  const [wrongInput, setWrongInput] = React.useState("")
  const [rightInput, setRightInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  function handleOpenChange(next: boolean) {
    if (next) setForm(brandKit)
    setOpen(next)
  }

  function addBannedWord() {
    if (!bannedInput.trim()) return
    setForm({ ...form, bannedWords: [...form.bannedWords, bannedInput.trim()] })
    setBannedInput("")
  }
  function removeBannedWord(word: string) {
    setForm({ ...form, bannedWords: form.bannedWords.filter((w) => w !== word) })
  }
  function addPreferredTerm() {
    if (!wrongInput.trim() || !rightInput.trim()) return
    setForm({ ...form, preferredTerms: [...form.preferredTerms, { wrong: wrongInput.trim(), right: rightInput.trim() }] })
    setWrongInput("")
    setRightInput("")
  }
  function removePreferredTerm(wrong: string) {
    setForm({ ...form, preferredTerms: form.preferredTerms.filter((t) => t.wrong !== wrong) })
  }

  async function handleSave() {
    setLoading(true)
    try {
      await updateBrandKit(form)
      toast.success("Brand kit updated")
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Settings2 className="h-4 w-4" /> Edit brand kit</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Brand kit</DialogTitle>
          <DialogDescription>These rules are scanned against every piece of content automatically.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Brand tone</Label>
            <Input value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="e.g. friendly, professional" />
          </div>

          <div className="space-y-1.5">
            <Label>Banned words / phrases</Label>
            <div className="flex gap-2">
              <Input value={bannedInput} onChange={(e) => setBannedInput(e.target.value)} placeholder="e.g. guaranteed" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBannedWord())} />
              <Button type="button" variant="secondary" onClick={addBannedWord}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.bannedWords.map((w) => (
                <Badge key={w} variant="danger" className="gap-1 pr-1">
                  {w}
                  <button onClick={() => removeBannedWord(w)} className="ml-0.5 rounded-full hover:bg-black/10"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Preferred terminology</Label>
            <div className="flex gap-2">
              <Input value={wrongInput} onChange={(e) => setWrongInput(e.target.value)} placeholder="Instead of…" />
              <Input value={rightInput} onChange={(e) => setRightInput(e.target.value)} placeholder="…use this" />
              <Button type="button" variant="secondary" onClick={addPreferredTerm}>Add</Button>
            </div>
            <div className="space-y-1 pt-1">
              {form.preferredTerms.map((t) => (
                <div key={t.wrong} className="flex items-center justify-between rounded-md bg-surface-2 px-2.5 py-1.5 text-xs">
                  <span>&ldquo;{t.wrong}&rdquo; → &ldquo;{t.right}&rdquo;</span>
                  <button onClick={() => removePreferredTerm(t.wrong)} className="rounded-full hover:bg-muted-2"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Required disclaimer text <span className="text-muted font-normal">(optional)</span></Label>
            <Textarea value={form.requiredDisclaimer} onChange={(e) => setForm({ ...form, requiredDisclaimer: e.target.value })} rows={2} placeholder="e.g. Results may vary. See terms for details." />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save brand kit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
