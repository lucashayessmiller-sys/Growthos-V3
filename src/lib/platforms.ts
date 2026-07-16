import { Camera, ThumbsUp, Briefcase, AtSign, Music2, type LucideIcon } from "lucide-react"

export type Platform = "instagram" | "facebook" | "linkedin" | "x" | "tiktok"

export interface PlatformDef {
  id: Platform
  label: string
  icon: LucideIcon
  badgeClass: string
  charLimit: number
  hashtagGuidance: string
}

export const PLATFORMS: Record<Platform, PlatformDef> = {
  instagram: { id: "instagram", label: "Instagram", icon: Camera, badgeClass: "bg-fuchsia-500/15 text-fuchsia-500", charLimit: 2200, hashtagGuidance: "5-15 hashtags, mix of broad and niche" },
  facebook: { id: "facebook", label: "Facebook", icon: ThumbsUp, badgeClass: "bg-blue-500/15 text-blue-500", charLimit: 2000, hashtagGuidance: "1-3 hashtags, keep it conversational" },
  linkedin: { id: "linkedin", label: "LinkedIn", icon: Briefcase, badgeClass: "bg-sky-600/15 text-sky-600", charLimit: 3000, hashtagGuidance: "3-5 professional hashtags" },
  x: { id: "x", label: "X", icon: AtSign, badgeClass: "bg-foreground/10 text-foreground", charLimit: 280, hashtagGuidance: "1-2 hashtags max, brevity wins" },
  tiktok: { id: "tiktok", label: "TikTok", icon: Music2, badgeClass: "bg-teal-500/15 text-teal-500", charLimit: 2200, hashtagGuidance: "3-6 trending + niche hashtags" },
}

export const PLATFORM_LIST = Object.values(PLATFORMS)
