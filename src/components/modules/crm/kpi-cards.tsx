import { DollarSign, TrendingUp, Users, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { PipelineStats } from "@/engines/crm"
import { formatCurrency } from "@/lib/utils"

const accentClasses = { growth: "bg-growth/10 text-growth", primary: "bg-primary/10 text-primary" } as const

export function CrmKpiCards({ contactCount, stats }: { contactCount: number; stats: PipelineStats }) {
  const cards = [
    { label: "Open pipeline value", value: formatCurrency(stats.totalValue), delta: `${formatCurrency(stats.weightedValue)} weighted`, icon: DollarSign, accent: "growth" as const },
    { label: "Win rate", value: `${stats.winRate}%`, delta: "Of closed deals", icon: TrendingUp, accent: "primary" as const },
    { label: "Total contacts", value: String(contactCount), delta: "Across all statuses", icon: Users, accent: "primary" as const },
    { label: "Deals in late stage", value: String(stats.byStage.find((s) => s.stage === "negotiation")?.count ?? 0), delta: "Proposal or negotiation", icon: Target, accent: "growth" as const },
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
