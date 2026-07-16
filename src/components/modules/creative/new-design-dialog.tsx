"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { CANVAS_PRESETS } from "@/engines/creative"
import { useCreativeStore } from "@/store/creative-store"
import { cn } from "@/lib/utils"

export function NewDesignDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const createDesign = useCreativeStore((s) => s.createDesign)
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [presetId, setPresetId] = React.useState(CANVAS_PRESETS[0].id)
  const [loading, setLoading] = React.useState(false)

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Give the design a name")
      return
    }
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId)!
    setLoading(true)
    try {
      const design = await createDesign({ name, canvasWidth: preset.width, canvasHeight: preset.height, layers: [], thumbnailDataUrl: null })
      setOpen(false)
      setName("")
      router.push(`/creative-studio/${design.id}`)
    } catch {
      toast.error("Couldn't create the design — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button><Plus className="h-4 w-4" /> New design</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New design</DialogTitle>
          <DialogDescription>Pick a canvas size to start with — you can add text, shapes, and colors on the next screen.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Design name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ridgeline Launch — IG Post" />
          </div>
          <div className="space-y-1.5">
            <Label>Canvas size</Label>
            <div className="grid grid-cols-2 gap-2">
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={cn("rounded-lg border p-2.5 text-left transition-colors", presetId === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-surface-2")}
                >
                  <p className="text-xs font-medium">{p.label}</p>
                  <p className="text-[11px] text-muted">{p.width} × {p.height} · {p.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
