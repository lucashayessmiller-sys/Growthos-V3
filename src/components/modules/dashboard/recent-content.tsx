"use client"
import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CardHeader, CardTitle, CardContent, Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useContentStore } from "@/store/content-store"
import type { ContentPiece } from "@/lib/types"

export function RecentContent({ initialItems }: { initialItems: ContentPiece[] }) {
  const pieces = useContentStore((s) => s.pieces)
  const hydrated = useContentStore((s) => s.hydrated)
  const hydrate = useContentStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialItems) }, [hydrate, initialItems])

  const source = hydrated ? pieces : initialItems
  const recentPieces = [...source].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5)

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent content activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/content-factory">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {recentPieces.map((p) => (
          <Link
            key={p.id}
            href={`/content-factory/${p.id}`}
            className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm hover:bg-surface-2 transition-colors"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{p.title}</p>
              <p className="text-xs text-muted capitalize">{p.type.replace("-", " ")} · {p.campaign}</p>
            </div>
            <Badge variant={p.status === "published" ? "growth" : p.status === "approved" ? "outline" : "secondary"} className="ml-3 shrink-0 capitalize">
              {p.status.replace("_", " ")}
            </Badge>
          </Link>
        ))}
        {recentPieces.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted">No content yet.</p>}
      </CardContent>
    </Card>
  )
}
