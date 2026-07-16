import { Radio, Search as SearchIcon, Music2, type LucideIcon } from "lucide-react"
import type { AdPlatform } from "@/lib/types"

export const AD_PLATFORMS: Record<AdPlatform, { label: string; icon: LucideIcon; badgeClass: string }> = {
  meta: { label: "Meta", icon: Radio, badgeClass: "bg-blue-500/15 text-blue-500" },
  google: { label: "Google", icon: SearchIcon, badgeClass: "bg-green-500/15 text-green-500" },
  tiktok: { label: "TikTok", icon: Music2, badgeClass: "bg-teal-500/15 text-teal-500" },
}
