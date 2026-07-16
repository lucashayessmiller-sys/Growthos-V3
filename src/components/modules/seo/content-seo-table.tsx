import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ContentSeoRow } from "@/lib/data/seo"

function scoreBadgeVariant(score: number): "growth" | "amber" | "danger" {
  if (score >= 75) return "growth"
  if (score >= 50) return "amber"
  return "danger"
}

// Real analysis of actual Content Factory pieces — not sample data.
export function ContentSeoTable({ rows }: { rows: ContentSeoRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content SEO &amp; AI-GEO health</CardTitle>
        <CardDescription>Computed from your actual Content Factory pieces.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">Title</th>
                <th className="pb-2 font-medium text-right">SEO</th>
                <th className="pb-2 font-medium text-right">AI-GEO</th>
                <th className="pb-2 font-medium">Top issue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.piece.id} className="border-b border-border last:border-0">
                  <td className="py-2.5">
                    <Link href={`/content-factory/${r.piece.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                      {r.piece.title}
                    </Link>
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge variant={scoreBadgeVariant(r.seoScore)} className="text-[10px]">{r.seoScore}</Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge variant={scoreBadgeVariant(r.geo.score)} className="text-[10px]">{r.geo.score}</Badge>
                  </td>
                  <td className="py-2.5 text-muted text-xs">{r.topIssue ?? "No issues found"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">No content yet — create something in Content Factory first.</p>}
      </CardContent>
    </Card>
  )
}
