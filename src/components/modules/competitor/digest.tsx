"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CompetitorSnapshot } from "@/lib/data/competitor"
import { generateCompetitorDigest, mockCompetitorDigest } from "@/lib/ai/competitor-generate"

export function CompetitorDigest({ snapshot }: { snapshot: CompetitorSnapshot }) {
  const [digest, setDigest] = React.useState<string>(() => mockCompetitorDigest(snapshot))
  const [loading, setLoading] = React.useState(false)

  async function regenerate() {
    setLoading(true)
    try {
      const text = await generateCompetitorDigest(snapshot)
      setDigest(text)
    } catch {
      toast.error("Couldn't generate a fresh summary — showing the last one")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Competitive positioning
        </CardTitle>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Regenerate
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{digest}</p>
        <Badge variant="outline" className="mt-3 text-[10px]">Mixes real workspace data with sample competitor tracking</Badge>
      </CardContent>
    </Card>
  )
}
