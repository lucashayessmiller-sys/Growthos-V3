import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import type { NapIssue } from "@/engines/local"

export function NapAudit({ issues }: { issues: NapIssue[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NAP consistency audit</CardTitle>
        <CardDescription>Name/Address/Phone consistency across your listed locations — a real local-SEO ranking factor.</CardDescription>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 className="h-4 w-4 text-growth" /> No inconsistencies found across your locations.
          </div>
        ) : (
          <ul className="space-y-2">
            {issues.map((issue, i) => (
              <li key={i} className="rounded-lg bg-amber/10 px-3 py-2 text-sm text-amber">
                <span className="font-medium">{issue.locationA}</span> vs <span className="font-medium">{issue.locationB}</span>: {issue.message}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
