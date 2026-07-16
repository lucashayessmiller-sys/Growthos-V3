"use client"
import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TrackedKeyword } from "@/engines/seo/keywords"
import { cn } from "@/lib/utils"

const DIFFICULTY_VARIANT = { Low: "growth", Medium: "amber", High: "danger" } as const

export function KeywordTracker({ keywords }: { keywords: TrackedKeyword[] }) {
  const [selected, setSelected] = React.useState(keywords[0]?.keyword)
  const active = keywords.find((k) => k.keyword === selected) ?? keywords[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword rank tracker</CardTitle>
        <CardDescription>Sample tracking data — connect a rank-tracking provider for live positions.</CardDescription>
      </CardHeader>
      <CardContent>
        {active && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={active.history} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(String(v)).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                tick={{ fontSize: 11 }}
                interval={4}
                className="fill-muted"
              />
              <YAxis reversed tick={{ fontSize: 11 }} className="fill-muted" width={30} domain={[1, "dataMax"]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(v) => new Date(String(v)).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                formatter={(value) => [`#${value}`, "Position"]}
              />
              <Line type="monotone" dataKey="position" stroke="#6D5EF5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 font-medium">Keyword</th>
                <th className="pb-2 font-medium text-right">Position</th>
                <th className="pb-2 font-medium text-right">7d change</th>
                <th className="pb-2 font-medium text-right">Est. volume</th>
                <th className="pb-2 font-medium text-right">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((k) => (
                <tr
                  key={k.keyword}
                  onClick={() => setSelected(k.keyword)}
                  className={cn("cursor-pointer border-b border-border last:border-0 hover:bg-surface-2", k.keyword === selected && "bg-surface-2")}
                >
                  <td className="py-2.5 font-medium">{k.keyword}</td>
                  <td className="py-2.5 text-right font-mono-data">#{k.currentPosition}</td>
                  <td className="py-2.5 text-right">
                    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", k.change7d > 0 ? "text-growth" : k.change7d < 0 ? "text-danger" : "text-muted")}>
                      {k.change7d > 0 ? <ArrowUp className="h-3 w-3" /> : k.change7d < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {Math.abs(k.change7d)}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-muted">{k.estMonthlySearches.toLocaleString()}/mo</td>
                  <td className="py-2.5 text-right">
                    <Badge variant={DIFFICULTY_VARIANT[k.difficulty]} className="text-[10px]">{k.difficulty}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
