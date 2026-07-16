"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { ShareOfVoiceRow } from "@/engines/competitor"

export function ShareOfVoiceChart({ rows }: { rows: ShareOfVoiceRow[] }) {
  const data = rows.map((r) => ({ name: r.name, traffic: r.traffic, isUs: r.isUs }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated monthly traffic vs. competitors</CardTitle>
        <CardDescription>Your figure is computed from real activity; competitor figures are sample tracking data.</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted" width={130} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              formatter={(value) => [Number(value).toLocaleString(), "Est. monthly visits"]}
            />
            <Bar dataKey="traffic" radius={[0, 4, 4, 0]}>
              {data.map((d) => <Cell key={d.name} fill={d.isUs ? "#22D3AE" : "#6D5EF5"} fillOpacity={d.isUs ? 1 : 0.55} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
