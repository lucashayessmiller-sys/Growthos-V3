import Link from "next/link"
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ModuleSignal } from "@/lib/data/cmo"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  good: { icon: CheckCircle2, className: "text-growth", badge: "bg-growth/10" },
  watch: { icon: AlertTriangle, className: "text-amber", badge: "bg-amber/10" },
  attention: { icon: AlertCircle, className: "text-danger", badge: "bg-danger/10" },
} as const

// Plain server-renderable grid — every value here is real data pulled from
// another module's own data-access function (see lib/data/cmo.ts).
export function SignalCards({ signals }: { signals: ModuleSignal[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {signals.map((s) => {
        const config = STATUS_CONFIG[s.status]
        const Icon = config.icon
        return (
          <Link key={s.module} href={s.href}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted">{s.module}</p>
                  <div className={cn("flex h-5 w-5 items-center justify-center rounded-full", config.badge)}>
                    <Icon className={cn("h-3 w-3", config.className)} />
                  </div>
                </div>
                <p className="mt-2 font-display text-lg font-semibold font-mono-data">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
                <p className="mt-1.5 text-[11px] text-muted">{s.detail}</p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
