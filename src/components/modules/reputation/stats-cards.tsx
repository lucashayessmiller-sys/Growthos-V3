import { Star, MessageSquareReply, ThumbsUp, ThumbsDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ReviewStats } from "@/engines/reputation"

const accentClasses = {
  growth: "bg-growth/10 text-growth",
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber/10 text-amber",
} as const

export function ReputationStatsCards({ stats }: { stats: ReviewStats }) {
  const cards = [
    { label: "Average rating", value: `${stats.avgRating.toFixed(1)} ★`, delta: `${stats.total} total reviews`, icon: Star, accent: "amber" as const },
    { label: "Response rate", value: `${stats.responseRate}%`, delta: `${stats.total - Math.round((stats.responseRate / 100) * stats.total)} awaiting reply`, icon: MessageSquareReply, accent: "primary" as const },
    { label: "Positive sentiment", value: String(stats.sentiment.positive), delta: `${Math.round((stats.sentiment.positive / Math.max(stats.total, 1)) * 100)}% of reviews`, icon: ThumbsUp, accent: "growth" as const },
    { label: "Negative sentiment", value: String(stats.sentiment.negative), delta: "Needs prompt attention", icon: ThumbsDown, accent: "amber" as const },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label}>
            <CardContent className="pt-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses[c.accent]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-display text-2xl font-semibold font-mono-data">{c.value}</p>
              <p className="mt-0.5 text-xs text-muted">{c.label}</p>
              <p className="mt-1.5 text-xs font-medium text-muted">{c.delta}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
