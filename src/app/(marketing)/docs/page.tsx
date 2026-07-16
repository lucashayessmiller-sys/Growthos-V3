import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Architecture — GrowthOS AI",
  description: "How GrowthOS AI is actually built: a shared AI router, deterministic engines, Supabase persistence, and a cost-first Next.js architecture.",
}

const PRINCIPLES = [
  {
    title: "One AI router, never called directly",
    body: "Every module calls a single ai.generate() function rather than importing a provider SDK. It handles provider selection, response caching, and — critically — falls back to a deterministic, template-based generator whenever no API key is configured or a request fails. The product never hard-breaks because of AI.",
  },
  {
    title: "Deterministic before AI",
    body: "SEO scoring, readability, sentiment classification, lead scoring, brand-compliance scanning, and NAP consistency checks all run as plain TypeScript — no AI call, no per-request cost, no latency. AI is reserved for what actually needs generation: writing, rewriting, and brainstorming.",
  },
  {
    title: "Real data first, honestly labeled sample data second",
    body: "Wherever a module would need a paid third-party API we don't have credentials for (SERP tracking, Google Business Profile, Meta/Google/TikTok Ads, SEMrush-style competitor data), the UI says so explicitly. Everything else — content, contacts, deals, locations, ad campaigns, brand rules — is genuinely real, user-owned data.",
  },
  {
    title: "Server Components by default",
    body: "List and dashboard pages fetch data server-side and render as static or server-rendered HTML. Client components are reserved for what actually needs interactivity: editors, calendars, charts, and forms.",
  },
  {
    title: "Runs at near-zero cost",
    body: "No background workers, cron jobs, or queues anywhere in the app. Every request is a normal on-demand serverless function or a statically prerendered page, so the whole platform runs cleanly on a free-tier deployment.",
  },
]

const STACK = [
  { label: "Framework", value: "Next.js (App Router, Server Components, Server Actions)" },
  { label: "Language", value: "TypeScript" },
  { label: "Styling", value: "Tailwind CSS + a hand-rolled shadcn/ui-style component library" },
  { label: "Database & Auth", value: "Supabase (Postgres, Row Level Security, Auth) — optional, with a zero-config demo fallback" },
  { label: "AI", value: "Anthropic API via a shared router, with deterministic fallbacks throughout" },
  { label: "Client state", value: "Zustand, used as an optimistic-UI cache layer, not a source of truth once Supabase is connected" },
]

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Badge variant="outline" className="mb-4">Architecture</Badge>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">How GrowthOS AI is actually built</h1>
      <p className="mt-4 text-muted">
        This isn&apos;t marketing copy about a hypothetical system — it&apos;s a description of the real codebase, including the parts that are still incomplete.
      </p>

      <div className="mt-10 space-y-5">
        {PRINCIPLES.map((p) => (
          <Card key={p.title}>
            <CardHeader><CardTitle className="text-base">{p.title}</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted leading-relaxed">{p.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-14 font-display text-xl font-semibold">Stack</h2>
      <div className="mt-4 divide-y divide-border rounded-xl border border-border">
        {STACK.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="w-40 shrink-0 text-sm font-medium">{s.label}</span>
            <span className="text-sm text-muted">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted">
          Deploys on Vercel&apos;s free Hobby tier with no configuration. Add an Anthropic API key and a Supabase project when you&apos;re ready for real AI generation and persistent, multi-user data.
        </p>
        <div className="mt-4 flex justify-center">
          <Button asChild><Link href="/signup">Try it yourself <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </div>
  )
}
