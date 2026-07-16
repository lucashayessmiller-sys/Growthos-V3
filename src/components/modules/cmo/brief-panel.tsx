"use client"
import * as React from "react"
import { toast } from "sonner"
import { Sparkles, Loader2, Pencil, CheckCircle2, History, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { RegeneratePopover } from "@/components/modules/content-factory/regenerate-popover"
import { useCmoStore } from "@/store/cmo-store"
import { generateCmoBrief, mockCmoBrief } from "@/lib/ai/cmo-generate"
import type { BusinessSnapshot, CmoBrief } from "@/lib/data/cmo"
import { formatDistanceToNow } from "date-fns"

export function BriefPanel({ snapshot, initialBrief }: { snapshot: BusinessSnapshot; initialBrief: CmoBrief | null }) {
  const brief = useCmoStore((s) => s.brief)
  const hydrate = useCmoStore((s) => s.hydrate)
  const createBrief = useCmoStore((s) => s.createBrief)
  const addVersion = useCmoStore((s) => s.addVersion)
  const updateStatus = useCmoStore((s) => s.updateStatus)
  React.useEffect(() => { hydrate(initialBrief) }, [hydrate, initialBrief])

  const [loading, setLoading] = React.useState(false)
  const [regenLoading, setRegenLoading] = React.useState(false)
  const [draft, setDraft] = React.useState("")

  const activeVersion = brief?.versions.find((v) => v.id === brief.activeVersionId)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local editable draft to the store's active brief version
    setDraft(activeVersion?.body ?? "")
  }, [activeVersion?.body])

  async function handleGenerate() {
    setLoading(true)
    try {
      const body = await generateCmoBrief(snapshot)
      await createBrief(body)
      toast.success("Brief generated")
    } catch {
      toast.error("Couldn't generate a brief — showing a locally-built summary instead")
      await createBrief(mockCmoBrief(snapshot))
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate(note: string) {
    setRegenLoading(true)
    try {
      const body = await generateCmoBrief(snapshot, note || undefined)
      addVersion(body, note ? `Regenerated: ${note}` : "Regenerated brief")
      toast.success("New brief generated")
    } catch {
      toast.error("Couldn't regenerate — please try again")
    } finally {
      setRegenLoading(false)
    }
  }

  function handleSaveEdit() {
    if (!brief) return
    addVersion(draft, "Manually edited", "human")
    toast.success("Brief updated")
  }

  if (!brief) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Sparkles className="h-8 w-8 text-primary" />
          <p className="mt-3 font-display text-sm font-semibold">No strategic brief yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Generate a weekly brief from the real signals above — priorities, what needs attention, and what to do about it.</p>
          <Button className="mt-4" onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate this week&apos;s brief
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Weekly strategic brief
          <Badge variant={brief.status === "approved" ? "growth" : "outline"} className="ml-1 text-[10px] capitalize">{brief.status}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <RegeneratePopover onRegenerate={handleRegenerate} loading={regenLoading} />
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="sm"><History className="h-3.5 w-3.5" /> History ({brief.versions.length})</Button></SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader><SheetTitle>Brief history</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-3">
                {[...brief.versions].reverse().map((v) => (
                  <div key={v.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={v.generatedBy === "ai" ? "outline" : "secondary"} className="text-[10px]">{v.generatedBy === "ai" ? "AI generated" : "Manually edited"}</Badge>
                      <span className="text-xs text-muted">{formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-xs text-muted line-clamp-4">{v.body}</p>
                    {v.id !== brief.activeVersionId && (
                      <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs" onClick={() => addVersion(v.body, "Restored from history", v.generatedBy)}>
                        <RotateCcw className="h-3 w-3" /> Restore
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={12} className="font-mono-data text-sm leading-relaxed" disabled={brief.status === "approved"} />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted">Last updated {formatDistanceToNow(new Date(brief.updatedAt), { addSuffix: true })}</span>
          {brief.status !== "approved" ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveEdit} disabled={draft === activeVersion?.body}>
                <Pencil className="h-3.5 w-3.5" /> Save edit
              </Button>
              <Button size="sm" onClick={() => updateStatus("approved")}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => updateStatus("draft")}>Reopen for edits</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
