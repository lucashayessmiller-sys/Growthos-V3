"use client"
import * as React from "react"
import { toast } from "sonner"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateKeywordOpportunities, type KeywordOpportunity } from "@/lib/ai/keyword-generate"

const DIFFICULTY_VARIANT = { Low: "growth", Medium: "amber", High: "danger" } as const

export function KeywordOpportunityFinder() {
  const [topic, setTopic] = React.useState("")
  const [results, setResults] = React.useState<KeywordOpportunity[]>([])
  const [loading, setLoading] = React.useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    try {
      const keywords = await generateKeywordOpportunities(topic)
      setResults(keywords)
    } catch {
      toast.error("Couldn't generate keyword ideas — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Keyword opportunity finder</CardTitle>
        <CardDescription>AI-estimated long-tail suggestions to validate against real search data — not guaranteed volumes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. hiking boots, email marketing, trail running" />
          <Button type="submit" disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Find ideas
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="pb-2 font-medium">Keyword</th>
                  <th className="pb-2 font-medium">Intent</th>
                  <th className="pb-2 font-medium text-right">Difficulty</th>
                  <th className="pb-2 font-medium">Why</th>
                </tr>
              </thead>
              <tbody>
                {results.map((k) => (
                  <tr key={k.keyword} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium">{k.keyword}</td>
                    <td className="py-2.5 text-muted text-xs">{k.intent}</td>
                    <td className="py-2.5 text-right">
                      <Badge variant={DIFFICULTY_VARIANT[k.estDifficulty]} className="text-[10px]">{k.estDifficulty}</Badge>
                    </td>
                    <td className="py-2.5 text-muted text-xs">{k.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
