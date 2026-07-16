import { Badge } from "@/components/ui/badge"

export function LeadScoreBadge({ score }: { score: number }) {
  const variant = score >= 70 ? "growth" : score >= 40 ? "amber" : "secondary"
  return <Badge variant={variant} className="text-[10px] font-mono-data">{score}</Badge>
}
