import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KeywordGap } from "@/engines/competitor"

// Real gap analysis — computed from actual Content Factory keywords against
// the sample competitor keyword lists. See engines/competitor/index.ts.
export function KeywordGapTable({ gaps }: { gaps: KeywordGap[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content gaps</CardTitle>
        <CardDescription>Keywords tracked competitors target that don&apos;t appear in any of your content briefs yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {gaps.map((g) => (
            <div key={g.keyword} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2.5">
              <span className="text-sm font-medium">{g.keyword}</span>
              <div className="flex gap-1">
                {g.competitorsTargeting.map((name) => <Badge key={name} variant="outline" className="text-[10px]">{name}</Badge>)}
              </div>
            </div>
          ))}
        </div>
        {gaps.length === 0 && <p className="py-8 text-center text-sm text-muted">No gaps found — your content already covers the keywords your tracked competitors target.</p>}
      </CardContent>
    </Card>
  )
}
