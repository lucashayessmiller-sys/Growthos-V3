"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContentStats, SocialStats } from "@/engines/analytics"
import { typeLabels } from "@/components/modules/content-factory/type-icon"
import { PLATFORMS } from "@/lib/platforms"
import type { ContentType } from "@/lib/types"

const BAR_COLORS = ["#6D5EF5", "#22D3AE", "#F5A623", "#38BDF8", "#F472B6", "#A78BFA", "#34D399"]

export function ContentTypeChart({ stats }: { stats: ContentStats }) {
  const data = stats.byType.map((t) => ({ name: typeLabels[t.type as ContentType] ?? t.type, count: t.count }))

  return (
    <Card>
      <CardHeader><CardTitle>Content by type</CardTitle></CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted" allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted" width={90} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {data.length === 0 && <p className="py-8 text-center text-sm text-muted">No content yet.</p>}
      </CardContent>
    </Card>
  )
}

export function PlatformChart({ stats }: { stats: SocialStats }) {
  const data = stats.byPlatform.map((p) => ({ name: PLATFORMS[p.platform as keyof typeof PLATFORMS]?.label ?? p.platform, count: p.count }))

  return (
    <Card>
      <CardHeader><CardTitle>Posts by platform</CardTitle></CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted" allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} className="fill-muted" width={90} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill={BAR_COLORS[(i + 2) % BAR_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {data.length === 0 && <p className="py-8 text-center text-sm text-muted">No posts yet.</p>}
      </CardContent>
    </Card>
  )
}
