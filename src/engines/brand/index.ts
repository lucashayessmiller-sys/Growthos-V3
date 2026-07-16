// Deterministic brand-compliance scanning — plain text matching against
// the org's brand kit rules, no AI call. This is exactly the class of
// task ("brand voice and asset compliance checks") the platform spec says
// should run as code, not generation.
import type { BrandKit, ComplianceIssue, ComplianceResult, ContentType } from "@/lib/types"

export interface BrandSnapshot {
  brandKit: BrandKit
  results: ComplianceResult[]
  stats: ComplianceStats
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  tone: "friendly",
  bannedWords: ["cheap", "guaranteed", "spam", "act now"],
  preferredTerms: [
    { wrong: "email", right: "e-mail" },
    { wrong: "webstore", right: "online store" },
  ],
  requiredDisclaimer: "",
  requireDisclaimerFor: [],
}

function wordBoundaryIncludes(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`\\b${escaped}\\b`, "i").test(text)
}

export function checkCompliance(body: string, contentType: ContentType | null, brandKit: BrandKit): ComplianceIssue[] {
  const issues: ComplianceIssue[] = []
  const lower = body.toLowerCase()

  for (const word of brandKit.bannedWords) {
    if (word && wordBoundaryIncludes(lower, word.toLowerCase())) {
      issues.push({ severity: "error", message: `Contains banned word/phrase: "${word}"` })
    }
  }

  for (const term of brandKit.preferredTerms) {
    if (term.wrong && wordBoundaryIncludes(lower, term.wrong.toLowerCase())) {
      issues.push({ severity: "warning", message: `Uses "${term.wrong}" — house style prefers "${term.right}"` })
    }
  }

  if (contentType && brandKit.requiredDisclaimer && brandKit.requireDisclaimerFor.includes(contentType)) {
    if (!lower.includes(brandKit.requiredDisclaimer.toLowerCase().slice(0, 30))) {
      issues.push({ severity: "error", message: "Missing required disclaimer for this content type" })
    }
  }

  // Simple ALL-CAPS shouting check — a common brand-voice violation.
  const shoutingWords = body.match(/\b[A-Z]{4,}\b/g) ?? []
  if (shoutingWords.length > 0) {
    issues.push({ severity: "warning", message: `Contains all-caps text (${shoutingWords.slice(0, 3).join(", ")}) — may read as shouting` })
  }

  return issues
}

export interface ComplianceStats {
  total: number
  passed: number
  compliancePct: number
  errorCount: number
  warningCount: number
  topIssues: { message: string; count: number }[]
}

export function computeComplianceStats(results: { issues: ComplianceIssue[] }[]): ComplianceStats {
  const total = results.length
  const passed = results.filter((r) => r.issues.length === 0).length
  const compliancePct = total ? Math.round((passed / total) * 100) : 100

  const errorCount = results.reduce((s, r) => s + r.issues.filter((i) => i.severity === "error").length, 0)
  const warningCount = results.reduce((s, r) => s + r.issues.filter((i) => i.severity === "warning").length, 0)

  const messageCounts = new Map<string, number>()
  for (const r of results) {
    for (const issue of r.issues) {
      // Group by the issue "shape" (strip the specific quoted word) so
      // repeated violations of the same rule count as one top issue.
      const key = issue.message.replace(/"[^"]+"/g, "\"…\"")
      messageCounts.set(key, (messageCounts.get(key) ?? 0) + 1)
    }
  }

  const topIssues = [...messageCounts.entries()]
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return { total, passed, compliancePct, errorCount, warningCount, topIssues }
}
