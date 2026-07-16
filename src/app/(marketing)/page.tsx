import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CheckCircle2, Cpu, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MODULES } from "@/lib/modules"
import { FaqJsonLd } from "@/components/marketing/json-ld"

export const metadata: Metadata = {
  title: "GrowthOS AI — The AI Marketing Operating System",
  description: "Replace fragmented marketing tools and agency retainers with one AI-run platform: content, social, SEO, analytics, reputation, CRM, local marketing, and paid ads.",
  openGraph: {
    title: "GrowthOS AI — The AI Marketing Operating System",
    description: "One AI-run platform for content, social, SEO, analytics, reputation, CRM, local marketing, and paid ads.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "GrowthOS AI", description: "The AI marketing operating system." },
}

const liveModules = MODULES.filter((m) => m.status === "live")

const FAQS = [
  { question: "Is GrowthOS AI a marketing agency?", answer: "No. GrowthOS AI is software you run yourself — every AI-generated draft is reviewed and approved by you before it goes anywhere. There are no retainers, account managers, or hourly billing." },
  { question: "What happens if I don't configure an AI provider?", answer: "Every generation feature has a deterministic fallback, so the product is fully usable without any AI API key configured. Add an Anthropic API key when you want live AI generation." },
  { question: "Do I need to connect a database to use it?", answer: "No — GrowthOS AI runs entirely in your browser with demo data until you're ready to connect a Supabase project for real persistence and multi-user access." },
  { question: "Which modules are actually functional today?", answer: `${liveModules.length} of 15 modules are fully built and usable now: ${liveModules.map((m) => m.name).join(", ")}. The rest are on the public roadmap.` },
]

export default function HomePage() {
  return (
    <>
      <FaqJsonLd items={FAQS} />

      <section className="relative overflow-hidden bg-grid">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <Badge variant="outline" className="mb-5">{liveModules.length} of 15 modules live today</Badge>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Everything you&apos;d hire a marketing agency for —<br className="hidden sm:block" /> <span className="text-gradient-signal">run as software.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted">
            Content, social, SEO, analytics, reputation, CRM, local marketing, and paid ads — unified in one AI-run workspace. Software instead of retainers. Automation instead of hourly billing. You own everything it produces.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild><Link href="/signup">Start free <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/product">See what&apos;s built</Link></Button>
          </div>
          <p className="mt-4 text-xs text-muted">No credit card required. Runs on a free demo workspace out of the box.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Software, not services</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">Three principles run through every module.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Zap, title: "AI when it earns its keep", body: "Writing, rewriting, and strategy go through AI. Scoring, analytics, and compliance checks run as plain deterministic code — faster, cheaper, and just as accurate." },
            { icon: ShieldCheck, title: "You approve everything", body: "Every AI draft goes through a review-and-approve workflow with full version history. Nothing publishes itself." },
            { icon: Cpu, title: "Built to run cheap", body: "No AI key or database required to start. Static rendering, on-demand functions, zero background workers — runs on a free-tier deployment." },
          ].map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title}>
                <CardContent className="pt-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-display text-sm font-semibold">{f.title}</p>
                  <p className="mt-1.5 text-sm text-muted">{f.body}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">15 modules, one platform</h2>
          <Link href="/product" className="text-sm font-medium text-primary hover:underline hidden sm:block">View full breakdown →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MODULES.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.slug} className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-display text-sm font-semibold">{m.name}</p>
                <p className="mt-1 text-xs text-muted line-clamp-2">{m.description}</p>
                {m.status === "live" ? (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-growth">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Live now
                  </div>
                ) : (
                  <div className="mt-2.5 text-xs text-muted">On the roadmap</div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="mb-6 text-center font-display text-2xl font-semibold sm:text-3xl">Frequently asked</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <Card key={f.question}>
              <CardContent className="pt-5">
                <p className="font-display text-sm font-semibold">{f.question}</p>
                <p className="mt-1.5 text-sm text-muted">{f.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface-2/40">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Start with what&apos;s already live</h2>
          <p className="mt-2 text-muted">{liveModules.length} modules are fully functional right now — no waitlist.</p>
          <Button size="lg" className="mt-6" asChild><Link href="/signup">Start free <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
    </>
  )
}
