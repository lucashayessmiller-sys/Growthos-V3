import { MapPin, CheckCircle2, AlertTriangle, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const accentClasses = { growth: "bg-growth/10 text-growth", primary: "bg-primary/10 text-primary", amber: "bg-amber/10 text-amber" } as const

export function LocalKpiCards({ locationCount, avgCompleteness, napIssueCount, avgRating }: { locationCount: number; avgCompleteness: number; napIssueCount: number; avgRating: number }) {
  const cards = [
    { label: "Locations", value: String(locationCount), delta: "Managed in this workspace", icon: MapPin, accent: "primary" as const },
    { label: "Avg. listing completeness", value: `${avgCompleteness}%`, delta: "Address, hours, phone, description", icon: CheckCircle2, accent: "growth" as const },
    { label: "NAP consistency issues", value: String(napIssueCount), delta: "Mismatched formatting across locations", icon: AlertTriangle, accent: "amber" as const },
    { label: "Avg. rating across locations", value: avgRating > 0 ? avgRating.toFixed(1) : "—", delta: "From Reputation Manager", icon: Star, accent: "growth" as const },
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
