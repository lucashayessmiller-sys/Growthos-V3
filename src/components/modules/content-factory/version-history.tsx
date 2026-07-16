"use client"
import { History, RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { ContentPiece } from "@/lib/types"
import { cn } from "@/lib/utils"

export function VersionHistory({ piece, onRestore }: { piece: ContentPiece; onRestore: (versionId: string) => void }) {
  const sorted = [...piece.versions].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm"><History className="h-4 w-4" /> History ({piece.versions.length})</Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Version history</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {sorted.map((v) => {
            const active = v.id === piece.activeVersionId
            return (
              <div key={v.id} className={cn("rounded-lg border p-3", active ? "border-primary bg-primary/5" : "border-border")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={v.generatedBy === "ai" ? "outline" : "secondary"} className="text-[10px]">
                      {v.generatedBy === "ai" ? "AI generated" : "Manually edited"}
                    </Badge>
                    {active && <Badge className="text-[10px]">Active</Badge>}
                  </div>
                  <span className="text-xs text-muted">{formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="mt-2 text-xs text-muted line-clamp-3 whitespace-pre-wrap">{v.body}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted">{v.note} · {v.wordCount} words</span>
                  {!active && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onRestore(v.id)}>
                      <RotateCcw className="h-3 w-3" /> Restore
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
