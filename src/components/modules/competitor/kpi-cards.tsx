import { PieChart, Users, Target, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { CompetitorSnapshot } from "@/lib/data/competitor"

const accentClasses = {
  growth: "bg-growth/10 text-growth",
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber/10 text-amber",
} as const

export function CompetitorKpiCards({ snapshot }: { snapshot: CompetitorSnapshot }) {
  const cards = [
    { label: "Estimated share of voice", value: `${snapshot.shareOfVoice.ourSharePct}%`, delta: `vs ${snapshot.competitors.length} tracked competitors`, icon: PieChart, accent: "growth" as const },
    { label: "Competitors tracked", value: String(snapshot.competitors.length), delta: "Sample tracking data", icon: Users, accent: "primary" as const },
    { label: "Keyword gaps found", value: String(snapshot.keywordGaps.length), delta: "Competitor keywords we don't target", icon: Target, accent: "amber" as const },
    { label: "Our tracked keywords", value: String(snapshot.ourKeywordCount), delta: "From Content Factory briefs", icon: Search, accent: "primary" as const },
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
