import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MODULES, MODULE_GROUPS } from "@/lib/modules"
import { BreadcrumbJsonLd } from "@/components/marketing/json-ld"

export const metadata: Metadata = {
  title: "Product — GrowthOS AI",
  description: "A full breakdown of every GrowthOS AI module — all fully live and functional today.",
}

const liveCount = MODULES.filter((m) => m.status === "live").length

export default function ProductPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Product", url: "/product" }]} />

      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="mb-4">{liveCount} modules live</Badge>
        <h1 className="font-display text-3xl font-semibold sm:text-5xl">One platform, 12 marketing functions</h1>
        <p className="mt-4 text-muted">
          Every module shares the same auth, workspace, design system, and AI infrastructure. All 12 are fully
          functional today — no module is listed as available unless you can use it right now.
        </p>
      </div>

      {MODULE_GROUPS.map((group) => (
        <div key={group} className="mt-14">
          <h2 className="mb-4 font-display text-xl font-semibold">{group}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.filter((m) => m.group === group).map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.slug}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      <Badge variant="growth" className="gap-1 text-[10px]"><CheckCircle2 className="h-3 w-3" /> Live</Badge>
                    </div>
                    <p className="mt-3 font-display text-sm font-semibold">{m.name}</p>
                    <p className="mt-1.5 text-sm text-muted">{m.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mt-16 rounded-xl border border-border bg-surface-2/40 p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Want the technical details?</h2>
        <p className="mt-2 text-muted">See how the AI router, deterministic engines, and Supabase-backed persistence actually work.</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="outline" asChild><Link href="/docs">Read the architecture</Link></Button>
          <Button asChild><Link href="/signup">Start free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </div>
  )
}
