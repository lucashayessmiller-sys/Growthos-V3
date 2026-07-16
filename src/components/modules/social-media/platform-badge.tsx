import { PLATFORMS } from "@/lib/platforms"
import type { Platform } from "@/lib/platforms"
import { cn } from "@/lib/utils"

export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  const p = PLATFORMS[platform]
  const Icon = p.icon
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", p.badgeClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      {p.label}
    </div>
  )
}
