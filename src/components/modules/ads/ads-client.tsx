"use client"
import * as React from "react"
import { AdsKpiCards } from "@/components/modules/ads/kpi-cards"
import { CampaignCard } from "@/components/modules/ads/campaign-card"
import { CampaignDialog } from "@/components/modules/ads/campaign-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdsStore } from "@/store/ads-store"
import { computeAggregateStats } from "@/engines/ads"
import type { AdCampaign, AdCampaignStatus } from "@/lib/types"

const FILTERS: Array<{ value: AdCampaignStatus | "all"; label: string }> = [
  { value: "all", label: "All" }, { value: "draft", label: "Draft" }, { value: "active", label: "Active" },
  { value: "paused", label: "Paused" }, { value: "ended", label: "Ended" },
]

export function AdsClient({ initialCampaigns }: { initialCampaigns: AdCampaign[] }) {
  const campaigns = useAdsStore((s) => s.campaigns)
  const hydrated = useAdsStore((s) => s.hydrated)
  const hydrate = useAdsStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialCampaigns) }, [hydrate, initialCampaigns])

  const source = hydrated ? campaigns : initialCampaigns
  const [filter, setFilter] = React.useState<AdCampaignStatus | "all">("all")
  const filtered = source.filter((c) => filter === "all" || c.status === filter)
  const stats = computeAggregateStats(source)

  return (
    <div className="space-y-5">
      <AdsKpiCards stats={stats} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as AdCampaignStatus | "all")}>
          <TabsList>{FILTERS.map((f) => <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>)}</TabsList>
        </Tabs>
        <CampaignDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => <CampaignCard key={c.id} campaign={c} />)}
      </div>
      {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">No campaigns match this filter.</p>}
    </div>
  )
}
