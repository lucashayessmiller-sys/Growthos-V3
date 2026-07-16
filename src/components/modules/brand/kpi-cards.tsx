import { ShieldCheck, AlertTriangle, XCircle, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ComplianceStats } from "@/engines/brand"

const accentClasses = { growth: "bg-growth/10 text-growth", primary: "bg-primary/10 text-primary", amber: "bg-amber/10 text-amber", danger: "bg-danger/10 text-danger" } as const

export function BrandKpiCards({ stats }: { stats: ComplianceStats }) {
  const cards = [
    { label: "On-brand compliance", value: `${stats.compliancePct}%`, delta: `${stats.passed}/${stats.total} pieces clean`, icon: ShieldCheck, accent: "growth" as const },
    { label: "Hard violations", value: String(stats.errorCount), delta: "Banned words, missing disclaimers", icon: XCircle, accent: "danger" as const },
    { label: "Style warnings", value: String(stats.warningCount), delta: "House-style suggestions", icon: AlertTriangle, accent: "amber" as const },
    { label: "Content scanned", value: String(stats.total), delta: "Content Factory + Social Media", icon: FileText, accent: "primary" as const },
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
