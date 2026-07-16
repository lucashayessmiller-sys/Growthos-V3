import { Search, Sparkles, TrendingUp, FileSearch } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { SeoSnapshot } from "@/lib/data/seo"

const accentClasses = {
  growth: "bg-growth/10 text-growth",
  primary: "bg-primary/10 text-primary",
} as const

export function SeoKpiCards({ snapshot }: { snapshot: SeoSnapshot }) {
  const avgPosition = snapshot.trackedKeywords.length
    ? Math.round(snapshot.trackedKeywords.reduce((s, k) => s + k.currentPosition, 0) / snapshot.trackedKeywords.length)
    : 0
  const improving = snapshot.trackedKeywords.filter((k) => k.change7d > 0).length

  const cards = [
    { label: "Avg. content SEO score", value: `${snapshot.avgSeoScore}/100`, delta: `${snapshot.contentRows.length} pieces analyzed`, icon: FileSearch, accent: "primary" as const },
    { label: "Avg. AI-GEO readiness", value: `${snapshot.avgGeoScore}/100`, delta: "Structural readiness for AI answer engines", icon: Sparkles, accent: "growth" as const },
    { label: "Tracked keywords", value: String(snapshot.trackedKeywords.length), delta: `${improving} improving this week`, icon: Search, accent: "primary" as const },
    { label: "Avg. rank position", value: avgPosition > 0 ? `#${avgPosition}` : "—", delta: "Sample tracking data", icon: TrendingUp, accent: "growth" as const },
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
