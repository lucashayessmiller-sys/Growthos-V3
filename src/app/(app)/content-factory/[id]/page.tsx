"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Check, Send, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/modules/content-factory/status-badge"
import { typeIcons, typeLabels } from "@/components/modules/content-factory/type-icon"
import { VersionHistory } from "@/components/modules/content-factory/version-history"
import { RegeneratePopover } from "@/components/modules/content-factory/regenerate-popover"
import { ExportMenu } from "@/components/modules/content-factory/export-menu"
import { BriefForm } from "@/components/modules/content-factory/brief-form"
import { useContentStore } from "@/store/content-store"
import { generateContent } from "@/lib/ai/generate"
import { CAMPAIGNS } from "@/lib/demo-data"
import type { ContentStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

const STATUS_FLOW: ContentStatus[] = ["draft", "in_review", "approved", "scheduled", "published"]

export default function ContentEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const pieces = useContentStore((s) => s.pieces)
  const hydrate = useContentStore((s) => s.hydrate)
  const addVersion = useContentStore((s) => s.addVersion)
  const setActiveVersion = useContentStore((s) => s.setActiveVersion)
  const updateStatus = useContentStore((s) => s.updateStatus)
  const updateBrief = useContentStore((s) => s.updateBrief)
  const editActiveVersionBody = useContentStore((s) => s.editActiveVersionBody)

  React.useEffect(() => { hydrate() }, [hydrate])

  const piece = pieces.find((p) => p.id === params.id)
  const [regenLoading, setRegenLoading] = React.useState(false)
  const [briefOpen, setBriefOpen] = React.useState(false)
  const [localBrief, setLocalBrief] = React.useState(piece?.brief)
  const [draftBody, setDraftBody] = React.useState("")

  React.useEffect(() => {
    if (piece) {
      const active = piece.versions.find((v) => v.id === piece.activeVersionId)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local editable draft to the store's active version on navigation/regeneration
      setDraftBody(active?.body ?? "")
      setLocalBrief(piece.brief)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece?.id, piece?.activeVersionId])

  if (!piece) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted">This content piece doesn&apos;t exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/content-factory")}>
          Back to Content Factory
        </Button>
      </div>
    )
  }

  const Icon = typeIcons[piece.type]
  const activeVersion = piece.versions.find((v) => v.id === piece.activeVersionId)
  const currentStepIndex = STATUS_FLOW.indexOf(piece.status)

  async function handleRegenerate(note: string) {
    if (!piece) return
    setRegenLoading(true)
    try {
      const body = await generateContent(piece.brief, note || undefined)
      addVersion(piece.id, body, note ? `Regenerated: ${note}` : "Regenerated draft")
      toast.success("New draft generated")
    } catch {
      toast.error("Regeneration failed — please try again")
    } finally {
      setRegenLoading(false)
    }
  }

  function handleSaveEdits() {
    if (!piece) return
    editActiveVersionBody(piece.id, draftBody)
    toast.success("Changes saved")
  }

  function handleApplyBrief() {
    if (!piece || !localBrief) return
    updateBrief(piece.id, localBrief)
    setBriefOpen(false)
    toast.success("Brief updated — regenerate to apply changes")
  }

  function advanceStatus() {
    if (!piece) return
    const next = STATUS_FLOW[Math.min(currentStepIndex + 1, STATUS_FLOW.length - 1)]
    updateStatus(piece.id, next)
    toast.success(`Marked as ${next.replace("_", " ")}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/content-factory"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Icon className="h-3.5 w-3.5" /> {typeLabels[piece.type]} · {piece.campaign}
          </div>
          <h1 className="truncate font-display text-xl font-semibold">{piece.title}</h1>
        </div>
        <StatusBadge status={piece.status} />
      </div>

      {/* Status pipeline */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            {STATUS_FLOW.map((s, i) => (
              <span key={s} className={i <= currentStepIndex ? "text-primary font-medium capitalize" : "capitalize"}>
                {s.replace("_", " ")}
              </span>
            ))}
          </div>
          <Progress value={(currentStepIndex / (STATUS_FLOW.length - 1)) * 100} />
          {piece.status !== "published" && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={advanceStatus}>
                <Check className="h-3.5 w-3.5" />
                Mark as {STATUS_FLOW[Math.min(currentStepIndex + 1, STATUS_FLOW.length - 1)].replace("_", " ")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Draft</CardTitle>
              <div className="flex items-center gap-2">
                <RegeneratePopover onRegenerate={handleRegenerate} loading={regenLoading} />
                <VersionHistory piece={piece} onRestore={(vid) => { setActiveVersion(piece.id, vid); toast.success("Restored version") }} />
                <ExportMenu title={piece.title} body={draftBody} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={20}
                className="font-mono-data text-sm leading-relaxed"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {draftBody.split(/\s+/).filter(Boolean).length} words
                  {activeVersion && ` · Last updated ${formatDistanceToNow(new Date(activeVersion.createdAt), { addSuffix: true })}`}
                </span>
                <Button size="sm" variant="secondary" onClick={handleSaveEdits} disabled={draftBody === activeVersion?.body}>
                  <Pencil className="h-3.5 w-3.5" /> Save edits
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Scores</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {piece.seoScore > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted">SEO score</span><span className="font-medium">{piece.seoScore}/100</span></div>
                  <Progress value={piece.seoScore} />
                </div>
              )}
              <div>
                <div className="mb-1 flex justify-between text-xs"><span className="text-muted">Readability</span><span className="font-medium">{piece.readabilityScore}/100</span></div>
                <Progress value={piece.readabilityScore} indicatorClassName="bg-growth" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Brief</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setBriefOpen(true)}>Edit</Button>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Audience</span><span className="text-right">{piece.brief.audience || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tone</span><span className="capitalize">{piece.brief.tone}</span></div>
              <div className="flex justify-between"><span className="text-muted">Length</span><span className="capitalize">{piece.brief.length}</span></div>
              <div className="flex justify-between"><span className="text-muted">CTA</span><span className="text-right">{piece.brief.cta || "—"}</span></div>
              {piece.brief.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {piece.brief.keywords.map((k) => <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1.5">
                <span className="text-xs text-muted">Campaign</span>
                <Select defaultValue={piece.campaign} onValueChange={() => toast.success("Campaign updated")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGNS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between"><span className="text-muted">Owner</span><span>{piece.owner}</span></div>
              <div className="flex justify-between"><span className="text-muted">Created</span><span>{formatDistanceToNow(new Date(piece.createdAt), { addSuffix: true })}</span></div>
            </CardContent>
          </Card>

          {piece.status === "approved" && (
            <Button className="w-full" onClick={() => { updateStatus(piece.id, "published"); toast.success("Published") }}>
              <Send className="h-4 w-4" /> Publish now
            </Button>
          )}
        </div>
      </div>

      <Dialog open={briefOpen} onOpenChange={setBriefOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit brief</DialogTitle>
            <DialogDescription>Update the brief, then regenerate to apply it to a new draft.</DialogDescription>
          </DialogHeader>
          {localBrief && <BriefForm brief={localBrief} onChange={setLocalBrief} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBriefOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyBrief}>Save brief</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
