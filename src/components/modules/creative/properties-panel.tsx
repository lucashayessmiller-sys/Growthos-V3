"use client"
import { Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BRAND_PALETTE } from "@/engines/creative"
import type { DesignLayer, TextLayer } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PropertiesPanel({
  layer, onChange, onDelete, onReorder,
}: {
  layer: DesignLayer | null
  onChange: (patch: Partial<DesignLayer>) => void
  onDelete: () => void
  onReorder: (direction: "up" | "down") => void
}) {
  if (!layer) {
    return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Select a layer to edit its properties</div>
  }

  const isText = layer.type === "text"

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{layer.type} layer</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReorder("up")}><ArrowUp className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReorder("down")}><ArrowDown className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-danger" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {isText && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs">Text</Label>
            <Textarea value={(layer as TextLayer).text} onChange={(e) => onChange({ text: e.target.value } as Partial<TextLayer>)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Font size</Label>
              <Input type="number" value={(layer as TextLayer).fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) } as Partial<TextLayer>)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Weight</Label>
              <Select value={String((layer as TextLayer).fontWeight)} onValueChange={(v) => onChange({ fontWeight: Number(v) } as Partial<TextLayer>)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[400, 500, 600, 700].map((w) => <SelectItem key={w} value={String(w)}>{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Alignment</Label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((a) => (
                <Button key={a} type="button" variant={(layer as TextLayer).align === a ? "secondary" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => onChange({ align: a } as Partial<TextLayer>)}>
                  {a}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">{isText ? "Text color" : "Fill color"}</Label>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => onChange(isText ? ({ color: c } as Partial<TextLayer>) : { fill: c })}
              className={cn("h-6 w-6 rounded-full border-2", ((isText ? (layer as TextLayer).color : (layer as { fill: string }).fill) === c) ? "border-primary" : "border-transparent")}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5"><Label className="text-xs">Width</Label><Input type="number" value={Math.round(layer.width)} onChange={(e) => onChange({ width: Number(e.target.value) })} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Height</Label><Input type="number" value={Math.round(layer.height)} onChange={(e) => onChange({ height: Number(e.target.value) })} /></div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Opacity</Label>
        <Input type="range" min={0} max={1} step={0.05} value={layer.opacity} onChange={(e) => onChange({ opacity: Number(e.target.value) })} />
      </div>
    </div>
  )
}
