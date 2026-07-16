"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChannelPoint } from "@/engines/analytics"

const SERIES = [
  { key: "organic", label: "Organic", color: "#6D5EF5" },
  { key: "social", label: "Social", color: "#22D3AE" },
  { key: "paid", label: "Paid", color: "#F5A623" },
  { key: "email", label: "Email", color: "#38BDF8" },
] as const

export function TrafficChart({ data }: { data: ChannelPoint[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Traffic by channel (30 days)</CardTitle></CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(String(v)).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              tick={{ fontSize: 11 }}
              interval={4}
              className="fill-muted"
            />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted" width={40} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelFormatter={(v) => new Date(String(v)).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SERIES.map((s) => (
              <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stackId="1" stroke={s.color} fill={s.color} fillOpacity={0.25} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
