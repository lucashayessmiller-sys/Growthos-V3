// Deterministic helpers for Creative Studio: canvas size presets, a brand
// color palette (matching the app's own design tokens), and layer
// factories. No AI call anywhere in this file — layer creation and
// positioning are plain, predictable code.
import type { DesignLayer, ShapeLayer, TextLayer } from "@/lib/types"

export interface CanvasPreset {
  id: string
  label: string
  width: number
  height: number
  description: string
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: "ig-post", label: "Instagram Post", width: 1080, height: 1080, description: "Square, 1:1" },
  { id: "ig-story", label: "Instagram/Story", width: 1080, height: 1920, description: "Vertical, 9:16" },
  { id: "fb-ad", label: "Facebook Ad", width: 1200, height: 628, description: "Landscape, ~1.91:1" },
  { id: "pinterest", label: "Pinterest Pin", width: 1000, height: 1500, description: "Vertical, 2:3" },
  { id: "banner", label: "Web Banner", width: 1200, height: 300, description: "Wide banner, 4:1" },
]

// Matches the app's own violet/teal/amber signal palette rather than
// inventing a separate brand system.
export const BRAND_PALETTE = ["#6D5EF5", "#22D3AE", "#F5A623", "#0A0E17", "#F4F6FB", "#38BDF8", "#F472B6"]

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function createTextLayer(canvasWidth: number, canvasHeight: number, text = "Your headline here"): TextLayer {
  return {
    id: uid("layer"), type: "text", x: canvasWidth * 0.1, y: canvasHeight * 0.4,
    width: canvasWidth * 0.8, height: 100, rotation: 0, opacity: 1,
    text, fontSize: Math.round(canvasWidth * 0.06), fontFamily: "display", color: "#FFFFFF", fontWeight: 700, align: "center",
  }
}

export function createShapeLayer(type: "rect" | "circle", canvasWidth: number, canvasHeight: number): ShapeLayer {
  const size = Math.min(canvasWidth, canvasHeight) * 0.3
  return {
    id: uid("layer"), type, x: canvasWidth / 2 - size / 2, y: canvasHeight / 2 - size / 2,
    width: size, height: size, rotation: 0, opacity: 1, fill: BRAND_PALETTE[0],
  }
}

export function reorderLayer(layers: DesignLayer[], id: string, direction: "up" | "down"): DesignLayer[] {
  const index = layers.findIndex((l) => l.id === id)
  if (index === -1) return layers
  const targetIndex = direction === "up" ? index + 1 : index - 1
  if (targetIndex < 0 || targetIndex >= layers.length) return layers
  const next = [...layers]
  ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
  return next
}
