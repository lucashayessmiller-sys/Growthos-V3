"use client"
import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Check, Send, Pencil, CalendarClock, X as XIcon, Heart, MessageCircle, Repeat2, Bookmark, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/modules/content-factory/status-badge"
import { PlatformBadge } from "@/components/modules/social-media/platform-badge"
import { SocialVersionHistory } from "@/components/modules/social-media/version-history"
import { RegeneratePopover } from "@/components/modules/content-factory/regenerate-popover"
import { ExportMenu } from "@/components/modules/content-factory/export-menu"
import { SocialBriefForm } from "@/components/modules/social-media/brief-form"
import { useSocialStore } from "@/store/social-store"
import { generateSocialCaption } from "@/lib/ai/social-generate"
import { PLATFORMS } from "@/lib/platforms"
import { CAMPAIGNS } from "@/lib/demo-data"
import type { SocialStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

const STATUS_FLOW: SocialStatus[] = ["draft", "in_review", "approved", "scheduled", "published"]

export default function SocialEditorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const posts = useSocialStore((s) => s.posts)
  const hydrate = useSocialStore((s) => s.hydrate)
  const addVersion = useSocialStore((s) => s.addVersion)
  const setActiveVersion = useSocialStore((s) => s.setActiveVersion)
  const updateStatus = useSocialStore((s) => s.updateStatus)
  const updateBrief = useSocialStore((s) => s.updateBrief)
  const editActiveVersionCaption = useSocialStore((s) => s.editActiveVersionCaption)
  const schedulePost = useSocialStore((s) => s.schedulePost)

  React.useEffect(() => { hydrate() }, [hydrate])

  const post = posts.find((p) => p.id === params.id)
  const [regenLoading, setRegenLoading] = React.useState(false)
  const [briefOpen, setBriefOpen] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [scheduleDate, setScheduleDate] = React.useState("")
  const [localBrief, setLocalBrief] = React.useState(post?.brief)
  const [caption, setCaption] = React.useState("")
  const [hashtags, setHashtags] = React.useState<string[]>([])

  React.useEffect(() => {
    if (post) {
      const active = post.versions.find((v) => v.id === post.activeVersionId)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local editable draft to the store's active version on navigation/regeneration
      setCaption(active?.caption ?? "")
      setHashtags(active?.hashtags ?? [])
      setLocalBrief(post.brief)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, post?.activeVersionId])

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted">This post doesn&apos;t exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/social-media")}>Back to Social Media Manager</Button>
      </div>
    )
  }

  const platform = PLATFORMS[post.platform]
  const activeVersion = post.versions.find((v) => v.id === post.activeVersionId)
  const currentStepIndex = STATUS_FLOW.indexOf(post.status)
  const charCount = caption.length
  const overLimit = charCount > platform.charLimit
  const exportBody = `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`.trim()

  async function handleRegenerate(note: string) {
    if (!post) return
    setRegenLoading(true)
    try {
      const result = await generateSocialCaption(post.brief, note || undefined)
      addVersion(post.id, result.caption, result.hashtags, note ? `Regenerated: ${note}` : "Regenerated draft")
      toast.success("New caption generated")
    } catch {
      toast.error("Regeneration failed — please try again")
    } finally {
      setRegenLoading(false)
    }
  }

  function handleSaveEdits() {
    if (!post) return
    editActiveVersionCaption(post.id, caption)
    toast.success("Changes saved")
  }

  function handleApplyBrief() {
    if (!post || !localBrief) return
    updateBrief(post.id, localBrief)
    setBriefOpen(false)
    toast.success("Brief updated — regenerate to apply changes")
  }

  function advanceStatus() {
    if (!post) return
    const next = STATUS_FLOW[Math.min(currentStepIndex + 1, STATUS_FLOW.length - 1)]
    if (next === "scheduled") {
      setScheduleOpen(true)
      return
    }
    updateStatus(post.id, next)
    toast.success(`Marked as ${next.replace("_", " ")}`)
  }

  function confirmSchedule() {
    if (!post || !scheduleDate) return
    schedulePost(post.id, new Date(scheduleDate).toISOString())
    setScheduleOpen(false)
    toast.success("Post scheduled")
  }

  function removeHashtag(tag: string) {
    setHashtags((h) => h.filter((t) => t !== tag))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/social-media"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <PlatformBadge platform={post.platform} /> <span>· {post.campaign}</span>
          </div>
          <h1 className="truncate font-display text-xl font-semibold">{post.title}</h1>
        </div>
        <StatusBadge status={post.status} />
      </div>

      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            {STATUS_FLOW.map((s, i) => (
              <span key={s} className={i <= currentStepIndex ? "text-primary font-medium capitalize" : "capitalize"}>{s.replace("_", " ")}</span>
            ))}
          </div>
          <Progress value={(currentStepIndex / (STATUS_FLOW.length - 1)) * 100} />
          {post.status !== "published" && (
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={advanceStatus}>
                <Check className="h-3.5 w-3.5" />
                Mark as {STATUS_FLOW[Math.min(currentStepIndex + 1, STATUS_FLOW.length - 1)].replace("_", " ")}
              </Button>
            </div>
          )}
          {post.scheduledFor && post.status === "scheduled" && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><CalendarClock className="h-3.5 w-3.5" /> Scheduled for {new Date(post.scheduledFor).toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Caption</CardTitle>
              <div className="flex items-center gap-2">
                <RegeneratePopover onRegenerate={handleRegenerate} loading={regenLoading} />
                <SocialVersionHistory post={post} onRestore={(vid) => { setActiveVersion(post.id, vid); toast.success("Restored version") }} />
                <ExportMenu title={post.title} body={exportBody} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={8} className="text-sm leading-relaxed" />
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${overLimit ? "text-danger font-medium" : "text-muted"}`}>
                  {charCount} / {platform.charLimit} characters {overLimit && "— over limit"}
                </span>
                <Button size="sm" variant="secondary" onClick={handleSaveEdits} disabled={caption === activeVersion?.caption}>
                  <Pencil className="h-3.5 w-3.5" /> Save edits
                </Button>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-muted">Hashtags</p>
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map((h) => (
                    <Badge key={h} variant="outline" className="gap-1 pr-1">
                      #{h}
                      <button onClick={() => removeHashtag(h)} className="ml-0.5 rounded-full hover:bg-surface-2"><XIcon className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                  {hashtags.length === 0 && <span className="text-xs text-muted">No hashtags</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {post.engagement && (
            <Card>
              <CardHeader><CardTitle>Engagement</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { icon: Heart, label: "Likes", value: post.engagement.likes },
                  { icon: MessageCircle, label: "Comments", value: post.engagement.comments },
                  { icon: Repeat2, label: "Shares", value: post.engagement.shares },
                  { icon: Bookmark, label: "Saves", value: post.engagement.saves },
                  { icon: Eye, label: "Reach", value: post.engagement.reach },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-surface-2 p-3 text-center">
                    <m.icon className="mx-auto h-4 w-4 text-primary" />
                    <p className="mt-1 font-mono-data text-sm font-semibold">{m.value.toLocaleString()}</p>
                    <p className="text-[11px] text-muted">{m.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Brief</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setBriefOpen(true)}>Edit</Button>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Audience</span><span className="text-right">{post.brief.audience || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tone</span><span className="capitalize">{post.brief.tone}</span></div>
              <div className="flex justify-between"><span className="text-muted">Media</span><span className="capitalize">{post.brief.mediaType}</span></div>
              <div className="flex justify-between"><span className="text-muted">CTA</span><span className="text-right">{post.brief.cta || "—"}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1.5">
                <span className="text-xs text-muted">Campaign</span>
                <Select defaultValue={post.campaign} onValueChange={() => toast.success("Campaign updated")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGNS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between"><span className="text-muted">Owner</span><span>{post.owner}</span></div>
              <div className="flex justify-between"><span className="text-muted">Created</span><span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span></div>
            </CardContent>
          </Card>

          {post.status === "approved" && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setScheduleOpen(true)}><CalendarClock className="h-4 w-4" /> Schedule</Button>
              <Button onClick={() => { updateStatus(post.id, "published"); toast.success("Published") }}><Send className="h-4 w-4" /> Publish now</Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={briefOpen} onOpenChange={setBriefOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit brief</DialogTitle>
            <DialogDescription>Update the brief, then regenerate to apply it to a new caption.</DialogDescription>
          </DialogHeader>
          {localBrief && <SocialBriefForm brief={localBrief} onChange={setLocalBrief} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBriefOpen(false)}>Cancel</Button>
            <Button onClick={handleApplyBrief}>Save brief</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Schedule post</DialogTitle>
            <DialogDescription>Pick a date and time to publish this to {platform.label}.</DialogDescription>
          </DialogHeader>
          <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={confirmSchedule} disabled={!scheduleDate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
