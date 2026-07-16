"use client"
import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/modules/content-factory/status-badge"
import { typeIcons, typeLabels } from "@/components/modules/content-factory/type-icon"
import { NewContentDialog } from "@/components/modules/content-factory/new-content-dialog"
import { useContentStore } from "@/store/content-store"
import type { ContentPiece, ContentStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

const STATUS_FILTERS: Array<{ value: ContentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
]

export function ContentFactoryClient({ initialItems }: { initialItems: ContentPiece[] }) {
  const pieces = useContentStore((s) => s.pieces)
  const hydrated = useContentStore((s) => s.hydrated)
  const hydrate = useContentStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialItems) }, [hydrate, initialItems])

  // Before the client store hydrates (first paint), render the server-fetched
  // list directly so there's no flash of empty state — this is the whole
  // point of fetching on the server rather than only seeding on the client.
  const source = hydrated ? pieces : initialItems

  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<ContentStatus | "all">("all")

  const filtered = source
    .filter((p) => status === "all" || p.status === status)
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.campaign.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Content Factory</h1>
          <p className="text-sm text-muted mt-0.5">Generate, edit, approve, and export on-brand content at scale.</p>
        </div>
        <NewContentDialog />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatus(v as ContentStatus | "all")}>
          <TabsList>
            {STATUS_FILTERS.map((s) => <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input placeholder="Search content or campaign…" className="w-full pl-8 sm:w-64" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const Icon = typeIcons[p.type]
          return (
            <Link key={p.id} href={`/content-factory/${p.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Icon className="h-3.5 w-3.5" /> {typeLabels[p.type]}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="font-display text-sm font-semibold leading-snug line-clamp-2">{p.title}</p>
                  <p className="mt-1 text-xs text-muted">{p.campaign}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted">
                    <span>{p.owner}</span>
                    <span>Updated {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}</span>
                  </div>
                  {p.seoScore > 0 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">SEO {p.seoScore}</Badge>
                      <Badge variant="outline" className="text-[10px]">Readability {p.readabilityScore}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">No content matches these filters.</p>
        </div>
      )}
    </>
  )
}
