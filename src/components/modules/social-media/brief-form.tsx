"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SocialBrief, SocialTone, MediaType } from "@/lib/types"
import { PLATFORM_LIST } from "@/lib/platforms"

const TONES: SocialTone[] = ["professional", "friendly", "bold", "playful", "authoritative", "empathetic"]
const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: "image", label: "Single image" },
  { value: "carousel", label: "Carousel" },
  { value: "video", label: "Video / Reel" },
  { value: "text", label: "Text only" },
]

export function SocialBriefForm({ brief, onChange }: { brief: SocialBrief; onChange: (b: SocialBrief) => void }) {
  function set<K extends keyof SocialBrief>(key: K, value: SocialBrief[K]) {
    onChange({ ...brief, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Topic</Label>
        <Input value={brief.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Weekend Trail Report" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Platform</Label>
          <Select value={brief.platform} onValueChange={(v) => set("platform", v as SocialBrief["platform"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLATFORM_LIST.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Media type</Label>
          <Select value={brief.mediaType} onValueChange={(v) => set("mediaType", v as MediaType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MEDIA_TYPES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Tone</Label>
          <Select value={brief.tone} onValueChange={(v) => set("tone", v as SocialTone)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Hashtags</Label>
          <Input type="number" min={0} max={15} value={brief.hashtagCount} onChange={(e) => set("hashtagCount", Number(e.target.value))} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Target audience</Label>
        <Input value={brief.audience} onChange={(e) => set("audience", e.target.value)} placeholder="e.g. lookalike audience, 24-40" />
      </div>

      <div className="space-y-1.5">
        <Label>Call to action</Label>
        <Input value={brief.cta} onChange={(e) => set("cta", e.target.value)} placeholder="e.g. Link in bio to shop" />
      </div>

      <div className="space-y-1.5">
        <Label>Notes for the AI <span className="text-muted font-normal">(optional)</span></Label>
        <Textarea value={brief.notes ?? ""} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Anything specific to mention or avoid…" />
      </div>
    </div>
  )
}
