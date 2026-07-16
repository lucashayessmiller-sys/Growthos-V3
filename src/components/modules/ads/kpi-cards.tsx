import { DollarSign, Megaphone, MousePointerClick, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AdsAggregateStats } from "@/engines/ads"
import { formatCurrency } from "@/lib/utils"

const accentClasses = { growth: "bg-growth/10 text-growth", primary: "bg-primary/10 text-primary", amber: "bg-amber/10 text-amber" } as const

export function AdsKpiCards({ stats }: { stats: AdsAggregateStats }) {
  const cards = [
    { label: "Active campaigns", value: String(stats.activeCampaigns), delta: "Currently running", icon: Megaphone, accent: "primary" as const },
    { label: "Total spend", value: formatCurrency(stats.totalSpend), delta: "Sample pacing simulation", icon: DollarSign, accent: "amber" as const },
    { label: "Avg. CTR", value: `${stats.avgCtr}%`, delta: "Across active/paused/ended", icon: MousePointerClick, accent: "growth" as const },
    { label: "Avg. CPA", value: stats.avgCpa > 0 ? formatCurrency(stats.avgCpa) : "—", delta: "Cost per conversion", icon: Target, accent: "growth" as const },
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
