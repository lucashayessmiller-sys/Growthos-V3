import type { BrandSnapshot } from "@/engines/brand"

export async function generateBrandDigest(snapshot: BrandSnapshot): Promise<string> {
  const res = await fetch("/api/generate-brand-digest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

export function mockBrandDigest(snapshot: BrandSnapshot): string {
  const { stats } = snapshot
  const topIssue = stats.topIssues[0]

  const lines = [
    `${stats.compliancePct}% of your content is fully on-brand (${stats.passed} of ${stats.total} pieces), with ${stats.errorCount} hard violation${stats.errorCount === 1 ? "" : "s"} and ${stats.warningCount} style warning${stats.warningCount === 1 ? "" : "s"} across everything scanned.`,
    topIssue ? `The most common issue is "${topIssue.message}", appearing ${topIssue.count} time${topIssue.count === 1 ? "" : "s"} — worth fixing at the source if it's a recurring AI-generation pattern.` : "No recurring issues found — your content is consistently on-brand.",
    stats.errorCount > 0 ? "Prioritize the hard violations first since those are explicit banned-word or missing-disclaimer issues, not just style preferences." : "Nothing blocking here — remaining items are style suggestions, not compliance risks.",
  ].filter(Boolean)

  return lines.join(" ")
}
