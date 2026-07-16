"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { BriefForm } from "@/components/modules/content-factory/brief-form"
import type { ContentBrief } from "@/lib/types"
import { generateContent } from "@/lib/ai/generate"
import { useContentStore } from "@/store/content-store"

const emptyBrief: ContentBrief = {
  topic: "",
  type: "blog",
  tone: "friendly",
  audience: "",
  keywords: [],
  length: "medium",
  cta: "",
  notes: "",
}

export function NewContentDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const createFromBrief = useContentStore((s) => s.createFromBrief)
  const [open, setOpen] = React.useState(false)
  const [brief, setBrief] = React.useState<ContentBrief>(emptyBrief)
  const [loading, setLoading] = React.useState(false)

  async function handleGenerate() {
    if (!brief.topic.trim()) {
      toast.error("Give the piece a topic first")
      return
    }
    setLoading(true)
    try {
      const body = await generateContent(brief)
      const piece = await createFromBrief(brief, body)
      toast.success("Draft generated")
      setOpen(false)
      setBrief(emptyBrief)
      router.push(`/content-factory/${piece.id}`)
    } catch {
      toast.error("Generation failed — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Sparkles className="h-4 w-4" /> New content</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New content brief</DialogTitle>
          <DialogDescription>GrowthOS AI will generate a first draft you can review, edit, and regenerate.</DialogDescription>
        </DialogHeader>
        <BriefForm brief={brief} onChange={setBrief} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
