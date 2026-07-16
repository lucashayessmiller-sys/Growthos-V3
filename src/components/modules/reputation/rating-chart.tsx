"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReviewStats } from "@/engines/reputation"

const COLORS: Record<number, string> = { 5: "#22D3AE", 4: "#6D5EF5", 3: "#F5A623", 2: "#FB923C", 1: "#F2545B" }

export function RatingChart({ stats }: { stats: ReviewStats }) {
  const data = stats.ratingDistribution.map((d) => ({ name: `${d.rating}★`, count: d.count, rating: d.rating }))

  return (
    <Card>
      <CardHeader><CardTitle>Rating distribution</CardTitle></CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted" />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted" width={30} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((d) => <Cell key={d.rating} fill={COLORS[d.rating]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
