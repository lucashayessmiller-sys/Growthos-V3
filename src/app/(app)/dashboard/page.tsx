import Link from "next/link"
import { FileText, TrendingUp, Users, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MODULES } from "@/lib/modules"
import { CURRENT_USER } from "@/lib/demo-data"
import { getInitialContentItems } from "@/lib/data/content"
import { RecentContent } from "@/components/modules/dashboard/recent-content"

const accentClasses = {
  growth: "bg-growth/10 text-growth",
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber/10 text-amber",
} as const

const kpis = [
  { label: "Pipeline influenced", value: "$184K", delta: "+12.4%", icon: TrendingUp, accent: "growth" as const },
  { label: "Content pieces live", value: "42", delta: "+6 this month", icon: FileText, accent: "primary" as const },
  { label: "Active leads", value: "318", delta: "+8.1%", icon: Users, accent: "primary" as const },
  { label: "AI actions this week", value: "1,204", delta: "+21%", icon: Zap, accent: "amber" as const },
]

// Server Component — KPI cards and module status are static/server-rendered;
// only the store-backed recent-activity list needs a client boundary.
export default async function DashboardPage() {
  const initialItems = await getInitialContentItems()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold">Good to see you, {CURRENT_USER.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted">Here&apos;s what your AI marketing department has been working on.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <Card key={k.label}>
              <CardContent className="pt-5">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses[k.accent]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-display text-2xl font-semibold font-mono-data">{k.value}</p>
                <p className="mt-0.5 text-xs text-muted">{k.label}</p>
                <p className="mt-1.5 text-xs font-medium text-growth">{k.delta}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <RecentContent initialItems={initialItems} />

        <Card>
          <CardHeader><CardTitle>Module status</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {MODULES.slice(0, 6).map((m) => (
              <div key={m.slug} className="flex items-center justify-between text-sm">
                <span className="text-muted">{m.shortName}</span>
                <Badge variant={m.status === "live" ? "growth" : "outline"} className="capitalize">
                  {m.status === "live" ? "Live" : "In development"}
                </Badge>
              </div>
            ))}
            <Button variant="secondary" size="sm" className="mt-2 w-full" asChild>
              <Link href="/content-factory">Open Content Factory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
