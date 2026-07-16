"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BrandSnapshot } from "@/engines/brand"
import { generateBrandDigest, mockBrandDigest } from "@/lib/ai/brand-generate"

export function BrandDigest({ snapshot }: { snapshot: BrandSnapshot }) {
  const [digest, setDigest] = React.useState<string>(() => mockBrandDigest(snapshot))
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-derive the fallback summary whenever the underlying scan results change (e.g. brand kit edited)
    setDigest(mockBrandDigest(snapshot))
  }, [snapshot])

  async function regenerate() {
    setLoading(true)
    try {
      const text = await generateBrandDigest(snapshot)
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
          <Sparkles className="h-4 w-4 text-primary" /> Brand health summary
        </CardTitle>
        <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Regenerate
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/90">{digest}</p>
        <Badge variant="outline" className="mt-3 text-[10px]">Based on a real scan of your content</Badge>
      </CardContent>
    </Card>
  )
}
