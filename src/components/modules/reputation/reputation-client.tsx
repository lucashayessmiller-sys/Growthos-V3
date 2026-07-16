"use client"
import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewCard } from "@/components/modules/reputation/review-card"
import { useReputationStore } from "@/store/reputation-store"
import type { ReviewWithResponse } from "@/lib/data/reputation"
import type { ReviewStatus } from "@/lib/types"

const FILTERS: Array<{ value: ReviewStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "needs_response", label: "Needs response" },
  { value: "responded", label: "Responded" },
]

export function ReputationClient({ reviews }: { reviews: ReviewWithResponse[] }) {
  const responses = useReputationStore((s) => s.responses)
  const hydrate = useReputationStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(reviews) }, [hydrate, reviews])

  const [filter, setFilter] = React.useState<ReviewStatus | "all">("all")

  const filtered = reviews.filter((r) => {
    const response = responses[r.id]
    const effectiveStatus: ReviewStatus = response?.status === "published" ? "responded" : r.status
    return filter === "all" || effectiveStatus === filter
  })

  return (
    <>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as ReviewStatus | "all")}>
        <TabsList className="mb-4">
          {FILTERS.map((f) => <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((review) => (
          <ReviewCard key={review.id} review={review} response={responses[review.id]} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted">No reviews match this filter.</p>
          </div>
        )}
      </div>
    </>
  )
}
