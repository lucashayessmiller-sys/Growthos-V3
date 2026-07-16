import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CampaignRow } from "@/engines/analytics"

// Plain server-renderable table — no client boundary needed.
export function CampaignTable({ rows }: { rows: CampaignRow[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Campaign performance</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">Campaign</th>
                <th className="pb-2 font-medium text-right">Content</th>
                <th className="pb-2 font-medium text-right">Social</th>
                <th className="pb-2 font-medium text-right">Published</th>
                <th className="pb-2 font-medium text-right">Reach</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.campaign} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium">{r.campaign}</td>
                  <td className="py-2.5 text-right text-muted">{r.contentCount}</td>
                  <td className="py-2.5 text-right text-muted">{r.socialCount}</td>
                  <td className="py-2.5 text-right">
                    <Badge variant="outline" className="text-[10px]">{r.publishedCount}</Badge>
                  </td>
                  <td className="py-2.5 text-right font-mono-data text-muted">{r.totalReach > 0 ? r.totalReach.toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted">No campaigns yet.</p>}
      </CardContent>
    </Card>
  )
}
