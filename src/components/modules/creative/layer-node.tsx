"use client"
import * as React from "react"
import type { DesignLayer } from "@/lib/types"
import { cn } from "@/lib/utils"

export function LayerNode({
  layer, scale, selected, onSelect, onMove,
}: {
  layer: DesignLayer
  scale: number
  selected: boolean
  onSelect: () => void
  onMove: (dx: number, dy: number) => void
}) {
  const dragRef = React.useRef<{ startX: number; startY: number } | null>(null)

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    onSelect()
    dragRef.current = { startX: e.clientX, startY: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = (e.clientX - dragRef.current.startX) / scale
    const dy = (e.clientY - dragRef.current.startY) / scale
    dragRef.current = { startX: e.clientX, startY: e.clientY }
    onMove(dx, dy)
  }
  function handlePointerUp() {
    dragRef.current = null
  }

  const style: React.CSSProperties = {
    position: "absolute",
    left: layer.x, top: layer.y, width: layer.width, height: layer.height,
    transform: `rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    cursor: "grab",
  }

  return (
    <div
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn("select-none", selected && "outline outline-2 outline-offset-2 outline-primary")}
    >
      {layer.type === "text" && (
        <div
          style={{
            fontSize: layer.fontSize, color: layer.color, fontWeight: layer.fontWeight, textAlign: layer.align,
            fontFamily: layer.fontFamily === "display" ? "var(--font-display)" : "var(--font-sans)",
            width: "100%", height: "100%", display: "flex", alignItems: "center",
            justifyContent: layer.align === "center" ? "center" : layer.align === "right" ? "flex-end" : "flex-start",
            wordBreak: "break-word", lineHeight: 1.1,
          }}
        >
          {layer.text}
        </div>
      )}
      {layer.type === "rect" && <div style={{ width: "100%", height: "100%", background: layer.fill, borderRadius: 8 }} />}
      {layer.type === "circle" && <div style={{ width: "100%", height: "100%", background: layer.fill, borderRadius: "9999px" }} />}
    </div>
  )
}
