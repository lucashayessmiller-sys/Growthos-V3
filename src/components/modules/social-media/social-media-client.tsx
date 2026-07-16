"use client"
import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/modules/content-factory/status-badge"
import { PlatformBadge } from "@/components/modules/social-media/platform-badge"
import { CalendarView } from "@/components/modules/social-media/calendar-view"
import { NewPostDialog } from "@/components/modules/social-media/new-post-dialog"
import { useSocialStore } from "@/store/social-store"
import type { SocialPost, SocialStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

const STATUS_FILTERS: Array<{ value: SocialStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "approved", label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
]

export function SocialMediaClient({ initialItems }: { initialItems: SocialPost[] }) {
  const posts = useSocialStore((s) => s.posts)
  const hydrated = useSocialStore((s) => s.hydrated)
  const hydrate = useSocialStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialItems) }, [hydrate, initialItems])

  const source = hydrated ? posts : initialItems

  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<SocialStatus | "all">("all")

  const filtered = source
    .filter((p) => status === "all" || p.status === status)
    .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.campaign.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Social Media Manager</h1>
          <p className="text-sm text-muted mt-0.5">Plan, generate, schedule, and analyze posts across every platform.</p>
        </div>
        <NewPostDialog />
      </div>

      <Tabs defaultValue="grid">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input placeholder="Search posts or campaign…" className="w-full pl-8 sm:w-64" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <TabsContent value="grid">
          <div className="mb-4 flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${status === s.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:bg-surface-2"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const activeVersion = p.versions.find((v) => v.id === p.activeVersionId)
              return (
                <Link key={p.id} href={`/social-media/${p.id}`}>
                  <Card className="h-full transition-colors hover:border-primary/40">
                    <CardContent className="pt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <PlatformBadge platform={p.platform} />
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="font-display text-sm font-semibold leading-snug line-clamp-2">{p.title}</p>
                      <p className="mt-1.5 text-xs text-muted line-clamp-2">{activeVersion?.caption}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted">
                        <span>{p.owner}</span>
                        <span>Updated {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })}</span>
                      </div>
                      {p.engagement && (
                        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                          <span>❤️ {p.engagement.likes}</span>
                          <span>💬 {p.engagement.comments}</span>
                          <span>↗ {p.engagement.reach.toLocaleString()}</span>
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
              <p className="text-sm text-muted">No posts match these filters.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView posts={source} />
        </TabsContent>
      </Tabs>
    </>
  )
}
