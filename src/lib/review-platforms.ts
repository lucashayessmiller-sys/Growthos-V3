import { MapPin, Utensils, ThumbsUp, Compass, type LucideIcon } from "lucide-react"
import type { ReviewPlatform } from "@/lib/types"

export interface ReviewPlatformDef {
  label: string
  icon: LucideIcon
  badgeClass: string
}

export const REVIEW_PLATFORMS: Record<ReviewPlatform, ReviewPlatformDef> = {
  google: { label: "Google", icon: MapPin, badgeClass: "bg-blue-500/15 text-blue-500" },
  yelp: { label: "Yelp", icon: Utensils, badgeClass: "bg-red-500/15 text-red-500" },
  facebook: { label: "Facebook", icon: ThumbsUp, badgeClass: "bg-sky-500/15 text-sky-500" },
  tripadvisor: { label: "TripAdvisor", icon: Compass, badgeClass: "bg-green-500/15 text-green-500" },
}
