import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Competitor } from "@/lib/types"

export function CompetitorTable({ competitors }: { competitors: Competitor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked competitors</CardTitle>
        <CardDescription>Sample tracking data — connect SEMrush, Ahrefs, or SimilarWeb for live metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">Competitor</th>
                <th className="pb-2 font-medium text-right">Monthly traffic</th>
                <th className="pb-2 font-medium text-right">Domain authority</th>
                <th className="pb-2 font-medium text-right">Social followers</th>
                <th className="pb-2 font-medium text-right">Est. ad spend</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-2.5">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted">{c.domain}</p>
                  </td>
                  <td className="py-2.5 text-right font-mono-data">{c.estMonthlyTraffic.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <Badge variant="outline" className="text-[10px]">{c.domainAuthority}</Badge>
                  </td>
                  <td className="py-2.5 text-right text-muted">{c.socialFollowers.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-muted">${c.adSpendEstimate.toLocaleString()}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
