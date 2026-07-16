import { Badge } from "@/components/ui/badge"
import type { ContentStatus } from "@/lib/types"

const statusMap: Record<ContentStatus, { label: string; variant: "secondary" | "outline" | "growth" | "amber" }> = {
  draft: { label: "Draft", variant: "secondary" },
  in_review: { label: "In review", variant: "amber" },
  approved: { label: "Approved", variant: "outline" },
  scheduled: { label: "Scheduled", variant: "outline" },
  published: { label: "Published", variant: "growth" },
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  const s = statusMap[status]
  return <Badge variant={s.variant}>{s.label}</Badge>
}
