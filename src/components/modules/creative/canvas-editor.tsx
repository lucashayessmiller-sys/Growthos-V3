"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Type, Square, Circle, Download, Save, Loader2, Sparkles, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayerNode } from "@/components/modules/creative/layer-node"
import { PropertiesPanel } from "@/components/modules/creative/properties-panel"
import { createTextLayer, createShapeLayer, reorderLayer, BRAND_PALETTE } from "@/engines/creative"
import { useCreativeStore } from "@/store/creative-store"
import { generateHeadline } from "@/lib/ai/creative-generate"
import type { CreativeDesign, DesignLayer, TextLayer } from "@/lib/types"
import { cn } from "@/lib/utils"

const MAX_DISPLAY_WIDTH = 480

export function CanvasEditor({ design }: { design: CreativeDesign }) {
  const router = useRouter()
  const updateDesign = useCreativeStore((s) => s.updateDesign)
  const [layers, setLayers] = React.useState<DesignLayer[]>(design.layers)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [background, setBackground] = React.useState("#0A0E17")
  const [saving, setSaving] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [headlineTopic, setHeadlineTopic] = React.useState("")

  const scale = Math.min(1, MAX_DISPLAY_WIDTH / design.canvasWidth)
  const selectedLayer = layers.find((l) => l.id === selectedId) ?? null

  function addLayer(layer: DesignLayer) {
    setLayers((prev) => [...prev, layer])
    setSelectedId(layer.id)
  }

  function updateLayer(id: string, patch: Partial<DesignLayer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)))
  }

  function moveLayer(id: string, dx: number, dy: number) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, x: l.x + dx, y: l.y + dy } : l)))
  }

  function deleteLayer(id: string) {
    setLayers((prev) => prev.filter((l) => l.id !== id))
    setSelectedId(null)
  }

  async function handleGenerateHeadline() {
    if (!headlineTopic.trim()) {
      toast.error("Enter a topic first")
      return
    }
    setGenerating(true)
    try {
      const text = await generateHeadline(headlineTopic)
      if (selectedLayer?.type === "text") {
        updateLayer(selectedLayer.id, { text } as Partial<TextLayer>)
      } else {
        addLayer(createTextLayer(design.canvasWidth, design.canvasHeight, text))
      }
      toast.success("Headline generated")
    } catch {
      toast.error("Couldn't generate a headline — please try again")
    } finally {
      setGenerating(false)
    }
  }

  // Rasterizes the current design to a real <canvas> at full resolution for
  // export/thumbnail — the editable DOM layers above are for interaction
  // only, this is what actually produces the PNG.
  function renderToCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = design.canvasWidth
    canvas.height = design.canvasHeight
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const layer of layers) {
      ctx.globalAlpha = layer.opacity
      if (layer.type === "text") {
        ctx.fillStyle = layer.color
        ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily === "display" ? "Space Grotesk, sans-serif" : "Inter, sans-serif"}`
        ctx.textAlign = layer.align
        ctx.textBaseline = "middle"
        const lines = layer.text.split("\n")
        const tx = layer.align === "center" ? layer.x + layer.width / 2 : layer.align === "right" ? layer.x + layer.width : layer.x
        lines.forEach((line, i) => ctx.fillText(line, tx, layer.y + layer.height / 2 + (i - (lines.length - 1) / 2) * layer.fontSize * 1.1))
      } else if (layer.type === "rect") {
        ctx.fillStyle = layer.fill
        ctx.fillRect(layer.x, layer.y, layer.width, layer.height)
      } else if (layer.type === "circle") {
        ctx.fillStyle = layer.fill
        ctx.beginPath()
        ctx.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    return canvas
  }

  function handleExport() {
    const canvas = renderToCanvas()
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${design.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Exported as PNG")
    }, "image/png")
  }

  async function handleSave() {
    setSaving(true)
    try {
      const canvas = renderToCanvas()
      const thumbCanvas = document.createElement("canvas")
      const thumbScale = 300 / design.canvasWidth
      thumbCanvas.width = 300
      thumbCanvas.height = design.canvasHeight * thumbScale
      thumbCanvas.getContext("2d")!.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
      const thumbnailDataUrl = thumbCanvas.toDataURL("image/jpeg", 0.7)

      updateDesign(design.id, { layers, thumbnailDataUrl })
      toast.success("Design saved")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/creative-studio")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold">{design.name}</h1>
          <p className="text-xs text-muted">{design.canvasWidth} × {design.canvasHeight}px</p>
        </div>
        <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4" /> Export PNG</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
            <Button variant="ghost" size="sm" onClick={() => addLayer(createTextLayer(design.canvasWidth, design.canvasHeight))}><Type className="h-4 w-4" /> Text</Button>
            <Button variant="ghost" size="sm" onClick={() => addLayer(createShapeLayer("rect", design.canvasWidth, design.canvasHeight))}><Square className="h-4 w-4" /> Rectangle</Button>
            <Button variant="ghost" size="sm" onClick={() => addLayer(createShapeLayer("circle", design.canvasWidth, design.canvasHeight))}><Circle className="h-4 w-4" /> Circle</Button>
            <div className="mx-1 h-5 w-px bg-border" />
            <span className="text-xs text-muted">Background</span>
            <div className="flex gap-1">
              {BRAND_PALETTE.map((c) => (
                <button key={c} onClick={() => setBackground(c)} className={cn("h-5 w-5 rounded-full border-2", background === c ? "border-primary" : "border-transparent")} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            <Input value={headlineTopic} onChange={(e) => setHeadlineTopic(e.target.value)} placeholder="Topic for AI headline…" className="h-8 flex-1 min-w-[140px]" />
            <Button size="sm" onClick={handleGenerateHeadline} disabled={generating}>
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Generate"}
            </Button>
          </div>

          <div className="flex justify-center overflow-auto rounded-xl border border-border bg-surface-2 p-6">
            <div
              onPointerDown={() => setSelectedId(null)}
              style={{ width: design.canvasWidth * scale, height: design.canvasHeight * scale, background, position: "relative", overflow: "hidden", boxShadow: "0 0 0 1px hsl(var(--border))" }}
            >
              <div style={{ width: design.canvasWidth, height: design.canvasHeight, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute" }}>
                {layers.map((layer) => (
                  <LayerNode
                    key={layer.id}
                    layer={layer}
                    scale={scale}
                    selected={layer.id === selectedId}
                    onSelect={() => setSelectedId(layer.id)}
                    onMove={(dx, dy) => moveLayer(layer.id, dx, dy)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <PropertiesPanel
          layer={selectedLayer}
          onChange={(patch) => selectedLayer && updateLayer(selectedLayer.id, patch)}
          onDelete={() => selectedLayer && deleteLayer(selectedLayer.id)}
          onReorder={(dir) => selectedLayer && setLayers(reorderLayer(layers, selectedLayer.id, dir))}
        />
      </div>
    </div>
  )
}
