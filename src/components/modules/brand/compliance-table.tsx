import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ComplianceResult } from "@/lib/types"

export function ComplianceTable({ results }: { results: ComplianceResult[] }) {
  const flagged = results.filter((r) => !r.passed)
  const clean = results.filter((r) => r.passed)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance scan results</CardTitle>
        <CardDescription>Every active Content Factory and Social Media Manager piece, scanned against your brand kit.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {flagged.map((r) => (
            <Link key={`${r.sourceType}-${r.sourceId}`} href={r.href} className="block rounded-lg bg-surface-2 px-3 py-2.5 hover:bg-muted-2 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{r.title}</p>
                <Badge variant="outline" className="text-[10px] capitalize shrink-0 ml-2">{r.sourceType}</Badge>
              </div>
              <ul className="mt-1.5 space-y-1">
                {r.issues.map((issue, i) => (
                  <li key={i} className={`text-xs ${issue.severity === "error" ? "text-danger" : "text-amber"}`}>
                    {issue.severity === "error" ? "⛔" : "⚠️"} {issue.message}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {clean.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 text-growth" /> {clean.length} other piece{clean.length === 1 ? "" : "s"} fully on-brand
          </div>
        )}
        {results.length === 0 && <p className="py-8 text-center text-sm text-muted">No content to scan yet — create something in Content Factory or Social Media Manager first.</p>}
      </CardContent>
    </Card>
  )
}
