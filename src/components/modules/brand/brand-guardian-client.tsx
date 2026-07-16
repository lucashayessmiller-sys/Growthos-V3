"use client"
import * as React from "react"
import { BrandKpiCards } from "@/components/modules/brand/kpi-cards"
import { BrandKitDialog } from "@/components/modules/brand/brand-kit-dialog"
import { BrandDigest } from "@/components/modules/brand/digest"
import { ComplianceTable } from "@/components/modules/brand/compliance-table"
import { useBrandStore } from "@/store/brand-store"
import { checkCompliance, computeComplianceStats, type BrandSnapshot } from "@/engines/brand"
import type { BrandKit, ComplianceResult, ContentPiece, SocialPost } from "@/lib/types"

export function BrandGuardianClient({ initialBrandKit, pieces, posts }: { initialBrandKit: BrandKit; pieces: ContentPiece[]; posts: SocialPost[] }) {
  const brandKit = useBrandStore((s) => s.brandKit)
  const hydrate = useBrandStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialBrandKit) }, [hydrate, initialBrandKit])

  // Recomputed on every render from whatever brand kit is currently in the
  // store — this is what makes editing the brand kit immediately reflect
  // in the scan, in both demo and Supabase modes, with no server round-trip.
  const snapshot: BrandSnapshot = React.useMemo(() => {
    const results: ComplianceResult[] = [
      ...pieces.map((p) => {
        const activeVersion = p.versions.find((v) => v.id === p.activeVersionId) ?? p.versions[p.versions.length - 1]
        const issues = checkCompliance(activeVersion?.body ?? "", p.type, brandKit)
        return { sourceId: p.id, sourceType: "content" as const, title: p.title, href: `/content-factory/${p.id}`, issues, passed: issues.length === 0 }
      }),
      ...posts.map((p) => {
        const activeVersion = p.versions.find((v) => v.id === p.activeVersionId) ?? p.versions[p.versions.length - 1]
        const issues = checkCompliance(activeVersion?.caption ?? "", null, brandKit)
        return { sourceId: p.id, sourceType: "social" as const, title: p.title, href: `/social-media/${p.id}`, issues, passed: issues.length === 0 }
      }),
    ]
    return { brandKit, results, stats: computeComplianceStats(results) }
  }, [brandKit, pieces, posts])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <BrandKitDialog brandKit={brandKit} />
      </div>
      <BrandKpiCards stats={snapshot.stats} />
      <BrandDigest snapshot={snapshot} />
      <ComplianceTable results={snapshot.results} />
    </div>
  )
}
