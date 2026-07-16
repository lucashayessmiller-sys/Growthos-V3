"use client"
import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ContentBrief, ContentType, Tone } from "@/lib/types"
import { typeLabels } from "@/components/modules/content-factory/type-icon"

const TYPES: ContentType[] = ["blog", "social", "email", "ad", "landing", "case-study", "newsletter"]
const TONES: Tone[] = ["professional", "friendly", "bold", "playful", "authoritative", "empathetic"]
const LENGTHS = [
  { value: "short", label: "Short (~150-200 words)" },
  { value: "medium", label: "Medium (~350-500 words)" },
  { value: "long", label: "Long (~700-900 words)" },
] as const

export function BriefForm({ brief, onChange }: { brief: ContentBrief; onChange: (b: ContentBrief) => void }) {
  function set<K extends keyof ContentBrief>(key: K, value: ContentBrief[K]) {
    onChange({ ...brief, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Topic / working title</Label>
        <Input value={brief.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Why Trail-Ready Gear Beats Trend-Ready Gear" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Content type</Label>
          <Select value={brief.type} onValueChange={(v) => set("type", v as ContentType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tone</Label>
          <Select value={brief.tone} onValueChange={(v) => set("tone", v as Tone)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Target audience</Label>
        <Input value={brief.audience} onChange={(e) => set("audience", e.target.value)} placeholder="e.g. outdoor enthusiasts aged 25-45" />
      </div>

      <div className="space-y-1.5">
        <Label>Keywords <span className="text-muted font-normal">(comma separated)</span></Label>
        <Input
          value={brief.keywords.join(", ")}
          onChange={(e) => set("keywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean))}
          placeholder="e.g. durable hiking gear, trail-tested equipment"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Length</Label>
          <Select value={brief.length} onValueChange={(v) => set("length", v as ContentBrief["length"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LENGTHS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Call to action</Label>
          <Input value={brief.cta} onChange={(e) => set("cta", e.target.value)} placeholder="e.g. Shop the collection" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes for the AI <span className="text-muted font-normal">(optional)</span></Label>
        <Textarea value={brief.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Any specifics — offers to mention, things to avoid, links to include…" rows={3} />
      </div>
    </div>
  )
}
