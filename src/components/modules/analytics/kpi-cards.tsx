import { TrendingUp, Users, FileText, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AnalyticsSnapshot } from "@/engines/analytics"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils"

const accentClasses = {
  growth: "bg-growth/10 text-growth",
  primary: "bg-primary/10 text-primary",
} as const

// Plain server-renderable component — no client boundary needed, since
// this is static markup derived entirely from props computed on the server.
export function KpiCards({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const totalTraffic = snapshot.trafficSeries.reduce((s, p) => s + p.organic + p.social + p.paid + p.email, 0)

  const cards = [
    { label: "Revenue influenced", value: formatCurrency(snapshot.revenue.total), delta: formatPercent(snapshot.revenue.deltaPct), icon: TrendingUp, accent: "growth" as const },
    { label: "Leads generated", value: formatNumber(snapshot.leads.total), delta: formatPercent(snapshot.leads.deltaPct), icon: Users, accent: "primary" as const },
    { label: "Content published", value: `${snapshot.content.published}/${snapshot.content.total}`, delta: `${snapshot.content.avgSeoScore} avg SEO`, icon: FileText, accent: "primary" as const },
    { label: "Total site visits (30d)", value: formatNumber(totalTraffic), delta: `${snapshot.social.avgEngagementRate}% social engagement`, icon: Share2, accent: "growth" as const },
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
              <p className="mt-1.5 text-xs font-medium text-growth">{c.delta}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
