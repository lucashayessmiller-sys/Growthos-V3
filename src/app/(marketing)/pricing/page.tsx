import Link from "next/link"
import type { Metadata } from "next"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MODULES } from "@/lib/modules"

export const metadata: Metadata = {
  title: "Pricing — GrowthOS AI",
  description: "Transparent, module-based pricing for GrowthOS AI. Start free, scale to every module as you grow — no custom retainers.",
}

const liveCount = MODULES.filter((m) => m.status === "live").length

const PLANS = [
  { name: "Starter", price: "$0", cadence: "forever", description: "For trying GrowthOS AI with your own workspace and demo data.", features: ["Demo workspace, no card required", "3 modules of your choice", "Deterministic AI fallback (no API key needed)", "Community support"], cta: "Start free", highlight: false },
  { name: "Growth", price: "$149", cadence: "/mo", description: "For a single team running content, social, and reporting day to day.", features: [`Up to 8 modules`, "Real Supabase persistence", "Bring your own Anthropic API key", "Email support"], cta: "Start free", highlight: true },
  { name: "Scale", price: "$449", cadence: "/mo", description: "For teams that want every live module and priority roadmap input.", features: [`All ${liveCount} live modules`, "Multiple workspace members with roles", "Priority feature requests", "Priority support"], cta: "Start free", highlight: false },
  { name: "Enterprise", price: "Custom", cadence: "", description: "For multi-location or multi-brand businesses with custom needs.", features: ["Custom deployment & SSO", "Dedicated onboarding", "Custom data retention", "SLA-backed support"], cta: "Contact us", highlight: false },
]

const FAQS = [
  { q: "Why is Starter free?", a: "GrowthOS AI is designed to run at near-zero infrastructure cost without an AI key or database connected, so we can offer a genuinely free tier rather than a time-limited trial." },
  { q: "What happens as new modules ship?", a: "Pricing is module-based. As more of the 15 modules go from roadmap to live, your plan's module allowance applies to whichever ones you choose." },
  { q: "Do I need a credit card to start?", a: "No. Starter requires no payment method." },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="mb-4">Simple, module-based pricing</Badge>
        <h1 className="font-display text-3xl font-semibold sm:text-5xl">Pricing that scales with what you actually use</h1>
        <p className="mt-4 text-muted">No custom retainers, no hourly billing, no sales calls required to see a price.</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.highlight ? "border-primary ring-1 ring-primary/30" : undefined}>
            <CardContent className="pt-6">
              {plan.highlight && <Badge className="mb-3">Most popular</Badge>}
              <p className="font-display text-lg font-semibold">{plan.name}</p>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>
              <p className="mt-4">
                <span className="font-display text-3xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted">{plan.cadence}</span>
              </p>
              <Button className="mt-5 w-full" variant={plan.highlight ? "default" : "outline"} asChild>
                <Link href={plan.name === "Enterprise" ? "/docs" : "/signup"}>{plan.cta}</Link>
              </Button>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-growth" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-2xl">
        <h2 className="text-center font-display text-2xl font-semibold">Pricing questions</h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((f) => (
            <Card key={f.q}>
              <CardContent className="pt-5">
                <p className="font-display text-sm font-semibold">{f.q}</p>
                <p className="mt-1.5 text-sm text-muted">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <Button size="lg" asChild><Link href="/signup">Start free <ArrowRight className="h-4 w-4" /></Link></Button>
      </div>
    </div>
  )
}
