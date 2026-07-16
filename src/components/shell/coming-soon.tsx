import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import type { ModuleDef } from "@/lib/modules"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const roadmapCopy: Record<string, string[]> = {
  "ai-cmo": ["Cross-module strategic briefs generated from live performance data", "Weekly AI-authored marketing plan with approve/edit workflow", "Budget and priority recommendations across every channel"],
  "seo-geo": ["Keyword & SERP rank tracking with historical trend charts", "Technical SEO audit crawler with prioritized fixes", "AI answer-engine visibility tracking (ChatGPT, Perplexity, Gemini)"],
  "creative-studio": ["AI image generation for ads and social", "Brand-kit-aware templates", "One-click resize across every ad placement"],
  "social-media": ["Unified composer for every platform", "AI captions tied to your brand voice", "Visual content calendar with approval flow"],
  "paid-ads": ["Cross-channel campaign builder (Meta, Google, TikTok)", "AI budget pacing and bid recommendations", "Creative performance analysis"],
  "local-marketing": ["Multi-location listings sync", "Local rank tracking by geo", "Location-level campaign templates"],
  "crm": ["Unified contact & deal pipeline", "AI lead scoring and next-best-action", "Native sync with every GrowthOS module"],
  "reputation": ["Review monitoring across Google, Yelp, and more", "AI-drafted, on-brand responses", "Sentiment trend reporting"],
  "brand-guardian": ["Automated brand-voice and asset compliance checks", "Approval workflows before anything ships", "Brand-kit as a single source of truth"],
  "competitor-intel": ["Competitor SEO, ad, and pricing tracking", "Weekly change alerts", "Side-by-side share-of-voice reporting"],
  "analytics": ["Unified cross-channel reporting", "AI-generated weekly insight digest", "Custom dashboards and exports"],
}

export function ComingSoon({ module }: { module: ModuleDef }) {
  const Icon = module.icon
  const items = roadmapCopy[module.slug] ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-semibold">{module.name}</h2>
            <Badge variant="outline">In development</Badge>
          </div>
          <p className="mt-1.5 max-w-xl text-sm text-muted">{module.description}</p>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-5">
          <p className="text-sm font-medium mb-3">What&apos;s shipping in this module</p>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-growth" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">12 modules are live right now</p>
          <p className="text-sm text-muted">Content, Social, Analytics, SEO/GEO, Reputation, Competitors, CRM, Brand, Local, Paid Ads, Creative Studio, and AI CMO.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link href="/content-factory">Content</Link></Button>
          <Button variant="outline" asChild><Link href="/social-media">Social</Link></Button>
          <Button variant="outline" asChild><Link href="/analytics">Analytics</Link></Button>
          <Button variant="outline" asChild><Link href="/seo-geo">SEO / GEO</Link></Button>
          <Button variant="outline" asChild><Link href="/reputation">Reputation</Link></Button>
          <Button variant="outline" asChild><Link href="/competitor-intel">Competitors</Link></Button>
          <Button variant="outline" asChild><Link href="/crm">CRM</Link></Button>
          <Button variant="outline" asChild><Link href="/brand-guardian">Brand</Link></Button>
          <Button variant="outline" asChild><Link href="/local-marketing">Local</Link></Button>
          <Button variant="outline" asChild><Link href="/paid-ads">Paid Ads</Link></Button>
          <Button variant="outline" asChild><Link href="/creative-studio">Creative</Link></Button>
          <Button asChild>
            <Link href="/ai-cmo">
              AI CMO <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
