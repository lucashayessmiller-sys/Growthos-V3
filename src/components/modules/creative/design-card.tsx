"use client"
import Link from "next/link"
import { MoreHorizontal, Trash2, ImageOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCreativeStore } from "@/store/creative-store"
import type { CreativeDesign } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

export function DesignCard({ design }: { design: CreativeDesign }) {
  const deleteDesign = useCreativeStore((s) => s.deleteDesign)
  const aspectRatio = design.canvasWidth / design.canvasHeight

  return (
    <Card className="overflow-hidden">
      <Link href={`/creative-studio/${design.id}`}>
        <div className="flex items-center justify-center bg-surface-2" style={{ aspectRatio }}>
          {design.thumbnailDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL thumbnail, not a static asset next/image can optimize
            <img src={design.thumbnailDataUrl} alt={design.name} className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="h-6 w-6 text-muted" />
          )}
        </div>
      </Link>
      <CardContent className="flex items-center justify-between p-3">
        <div className="min-w-0">
          <Link href={`/creative-studio/${design.id}`} className="truncate text-sm font-medium hover:text-primary transition-colors block">{design.name}</Link>
          <p className="text-xs text-muted">{design.canvasWidth}×{design.canvasHeight} · Updated {formatDistanceToNow(new Date(design.updatedAt), { addSuffix: true })}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => deleteDesign(design.id)} className="text-danger"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
