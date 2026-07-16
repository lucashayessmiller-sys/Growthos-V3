"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsSnapshot } from "@/engines/analytics"
import { generateInsightDigest, mockInsightDigest } from "@/lib/ai/insight-generate"

// The one AI-generated surface in an otherwise fully deterministic module —
// a natural-language read of numbers computed server-side, never inventing
// figures of its own (see the prompt in api/generate-insight/route.ts).
export function InsightDigest({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const [digest, setDigest] = React.useState<string>(() => mockInsightDigest(snapshot))
  const [loading, setLoading] = React.useState(false)

  async function regenerate() {
    setLoading(true)
    try {
      const text = await generateInsightDigest(snapshot)
      setDigest(text)
    } catch {
      toast.error("Couldn't generate a fresh digest — showing the last one")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> This week&apos;s insight
        </CardTitle>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Regenerate
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{digest}</p>
        <Badge variant="outline" className="mt-3 text-[10px]">Generated from live workspace data</Badge>
      </CardContent>
    </Card>
  )
}
