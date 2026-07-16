"use client"
import { MoreHorizontal, Trash2, Play, Pause, Square } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CampaignDialog } from "@/components/modules/ads/campaign-dialog"
import { useAdsStore } from "@/store/ads-store"
import { computeCampaignPerformance } from "@/engines/ads"
import { AD_PLATFORMS } from "@/lib/ad-platforms"
import type { AdCampaign } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

const statusVariant = { draft: "secondary", active: "growth", paused: "amber", ended: "outline" } as const
const pacingVariant = { under: "amber", "on-track": "growth", over: "danger" } as const

export function CampaignCard({ campaign }: { campaign: AdCampaign }) {
  const updateCampaignStatus = useAdsStore((s) => s.updateCampaignStatus)
  const deleteCampaign = useAdsStore((s) => s.deleteCampaign)
  const platform = AD_PLATFORMS[campaign.platform]
  const Icon = platform.icon
  const perf = computeCampaignPerformance(campaign)

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`gap-1 text-[10px] ${platform.badgeClass}`}><Icon className="h-3 w-3" /> {platform.label}</Badge>
              <Badge variant={statusVariant[campaign.status]} className="text-[10px] capitalize">{campaign.status}</Badge>
            </div>
            <p className="mt-1.5 font-display text-sm font-semibold">{campaign.name}</p>
            <p className="text-xs text-muted capitalize">{campaign.objective} · {formatCurrency(campaign.budgetDaily)}/day</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CampaignDialog campaign={campaign} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>} />
              {campaign.status === "draft" && <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, "active")}><Play className="mr-2 h-3.5 w-3.5" /> Activate</DropdownMenuItem>}
              {campaign.status === "active" && <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, "paused")}><Pause className="mr-2 h-3.5 w-3.5" /> Pause</DropdownMenuItem>}
              {campaign.status === "paused" && <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, "active")}><Play className="mr-2 h-3.5 w-3.5" /> Resume</DropdownMenuItem>}
              {(campaign.status === "active" || campaign.status === "paused") && <DropdownMenuItem onClick={() => updateCampaignStatus(campaign.id, "ended")}><Square className="mr-2 h-3.5 w-3.5" /> End campaign</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => deleteCampaign(campaign.id)} className="text-danger"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {campaign.headline && (
          <div className="mt-3 rounded-lg bg-surface-2 p-2.5">
            <p className="text-xs font-medium">{campaign.headline}</p>
            {campaign.body && <p className="mt-0.5 text-[11px] text-muted line-clamp-2">{campaign.body}</p>}
          </div>
        )}

        {perf && (
          <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-center">
            <div><p className="font-mono-data text-xs font-semibold">{formatCurrency(perf.totalSpend)}</p><p className="text-[10px] text-muted">Spend</p></div>
            <div><p className="font-mono-data text-xs font-semibold">{perf.ctr}%</p><p className="text-[10px] text-muted">CTR</p></div>
            <div><p className="font-mono-data text-xs font-semibold">{perf.totalConversions}</p><p className="text-[10px] text-muted">Conv.</p></div>
            <div><Badge variant={pacingVariant[perf.pacing]} className="text-[9px]">{perf.pacingPct}%</Badge><p className="mt-0.5 text-[10px] text-muted">Pacing</p></div>
          </div>
        )}
        {!perf && <p className="mt-3 border-t border-border pt-3 text-center text-[11px] text-muted">Activate to start performance simulation</p>}
      </CardContent>
    </Card>
  )
}
