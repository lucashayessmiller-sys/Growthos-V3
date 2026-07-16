"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { SocialBriefForm } from "@/components/modules/social-media/brief-form"
import type { SocialBrief } from "@/lib/types"
import { generateSocialCaption } from "@/lib/ai/social-generate"
import { useSocialStore } from "@/store/social-store"

const emptyBrief: SocialBrief = {
  topic: "", platform: "instagram", tone: "friendly", mediaType: "image", audience: "", hashtagCount: 5, cta: "", notes: "",
}

export function NewPostDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const createFromBrief = useSocialStore((s) => s.createFromBrief)
  const [open, setOpen] = React.useState(false)
  const [brief, setBrief] = React.useState<SocialBrief>(emptyBrief)
  const [loading, setLoading] = React.useState(false)

  async function handleGenerate() {
    if (!brief.topic.trim()) {
      toast.error("Give the post a topic first")
      return
    }
    setLoading(true)
    try {
      const { caption, hashtags } = await generateSocialCaption(brief)
      const post = await createFromBrief(brief, caption, hashtags)
      toast.success("Caption generated")
      setOpen(false)
      setBrief(emptyBrief)
      router.push(`/social-media/${post.id}`)
    } catch {
      toast.error("Generation failed — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Sparkles className="h-4 w-4" /> New post</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New social post</DialogTitle>
          <DialogDescription>GrowthOS AI will draft a platform-tailored caption you can edit, regenerate, and schedule.</DialogDescription>
        </DialogHeader>
        <SocialBriefForm brief={brief} onChange={setBrief} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate caption"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
