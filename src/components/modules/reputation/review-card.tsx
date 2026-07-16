"use client"
import * as React from "react"
import { toast } from "sonner"
import { Star, Loader2, Sparkles, Send, Pencil } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RegeneratePopover } from "@/components/modules/content-factory/regenerate-popover"
import { REVIEW_PLATFORMS } from "@/lib/review-platforms"
import type { Review } from "@/lib/types"
import type { ResponseState } from "@/store/reputation-store"
import { useReputationStore } from "@/store/reputation-store"
import { generateReviewResponse } from "@/lib/ai/reputation-generate"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

const sentimentVariant = { positive: "growth", neutral: "secondary", negative: "danger" } as const

export function ReviewCard({ review, response }: { review: Review; response?: ResponseState }) {
  const createResponse = useReputationStore((s) => s.createResponse)
  const addVersion = useReputationStore((s) => s.addVersion)
  const editVersionBody = useReputationStore((s) => s.editVersionBody)
  const publishResponse = useReputationStore((s) => s.publishResponse)

  const [loading, setLoading] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const platform = REVIEW_PLATFORMS[review.platform]
  const Icon = platform.icon

  const activeVersion = response?.versions.find((v) => v.id === response.activeVersionId)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local editable draft to the store's active response version
    setDraft(activeVersion?.body ?? "")
  }, [activeVersion?.body])

  async function handleGenerate() {
    setLoading(true)
    try {
      const text = await generateReviewResponse(review)
      if (response) addVersion(review.id, text, "Regenerated draft")
      else await createResponse(review, text)
    } catch {
      toast.error("Couldn't generate a response — please try again")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate(note: string) {
    setLoading(true)
    try {
      const text = await generateReviewResponse(review, note || undefined)
      addVersion(review.id, text, note ? `Regenerated: ${note}` : "Regenerated draft")
    } catch {
      toast.error("Couldn't regenerate — please try again")
    } finally {
      setLoading(false)
    }
  }

  function handleSaveEdit() {
    editVersionBody(review.id, draft)
    toast.success("Response updated")
  }

  function handlePublish() {
    if (draft !== activeVersion?.body) editVersionBody(review.id, draft)
    publishResponse(review.id)
    toast.success("Response published")
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback>{review.authorInitials}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-sm">{review.authorName}</span>
              <Badge variant="outline" className={cn("gap-1 text-[10px]", platform.badgeClass)}>
                <Icon className="h-3 w-3" /> {platform.label}
              </Badge>
              <Badge variant={sentimentVariant[review.sentiment]} className="text-[10px] capitalize">{review.sentiment}</Badge>
              <span className="ml-auto text-xs text-muted">{formatDistanceToNow(new Date(review.date), { addSuffix: true })}</span>
            </div>
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-amber text-amber" : "text-muted-2")} />
              ))}
              <span className="ml-1.5 text-xs text-muted">{review.location}</span>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{review.text}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          {!response ? (
            <Button size="sm" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Draft AI response
            </Button>
          ) : (
            <div className="rounded-lg bg-surface-2 p-3">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant={response.status === "published" ? "growth" : "outline"} className="text-[10px]">
                  {response.status === "published" ? "Published" : "Draft response"}
                </Badge>
                {response.status !== "published" && (
                  <RegeneratePopover onRegenerate={handleRegenerate} loading={loading} />
                )}
              </div>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                disabled={response.status === "published"}
                className="text-sm"
              />
              {response.status !== "published" && (
                <div className="mt-2 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveEdit} disabled={draft === activeVersion?.body}>
                    <Pencil className="h-3.5 w-3.5" /> Save edit
                  </Button>
                  <Button size="sm" onClick={handlePublish}>
                    <Send className="h-3.5 w-3.5" /> Publish reply
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
