// Deterministic SEO + readability scoring. No AI calls — this is exactly
// the class of task ("SEO scoring", "readability analysis") that should
// always run as plain code per GrowthOS AI's cost/architecture principles.

export interface SeoScoreResult {
  score: number // 0-100
  checks: { label: string; passed: boolean; detail: string }[]
}

export interface ReadabilityResult {
  score: number // 0-100, Flesch Reading Ease normalized
  gradeLevel: number
}

const STOP_WORDS = new Set(["the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with", "is", "are", "was", "were", "it", "this", "that"])

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "")
  if (w.length <= 3) return 1
  const matches = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").match(/[aeiouy]{1,2}/g)
  return matches ? Math.max(matches.length, 1) : 1
}

export function scoreReadability(body: string): ReadabilityResult {
  const text = body.replace(/[#*_`>[\]()]/g, "")
  const sentences = Math.max(text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length, 1)
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = Math.max(words.length, 1)
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0)

  const flesch = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount)
  const score = Math.round(Math.min(100, Math.max(0, flesch)))
  const gradeLevel = Math.round((0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59) * 10) / 10

  return { score, gradeLevel: Math.max(gradeLevel, 0) }
}

export function scoreSeo(body: string, title: string, keywords: string[]): SeoScoreResult {
  const text = body.toLowerCase()
  const wordCount = body.split(/\s+/).filter(Boolean).length
  const checks: SeoScoreResult["checks"] = []

  const hasH1 = /^#\s+.+/m.test(body)
  checks.push({ label: "Has a primary heading", passed: hasH1, detail: hasH1 ? "Found an H1-level heading" : "No H1 (# ) heading found" })

  const hasSubheadings = (body.match(/^##\s+.+/gm) ?? []).length >= 1
  checks.push({ label: "Uses subheadings", passed: hasSubheadings, detail: hasSubheadings ? "Content is broken into sections" : "Consider adding H2 subheadings" })

  const lengthOk = wordCount >= 150
  checks.push({ label: "Sufficient length", passed: lengthOk, detail: `${wordCount} words` })

  const primaryKeyword = keywords[0]?.toLowerCase()
  const keywordInBody = primaryKeyword ? text.includes(primaryKeyword) : false
  checks.push({ label: "Primary keyword present", passed: !primaryKeyword || keywordInBody, detail: primaryKeyword ? (keywordInBody ? `"${primaryKeyword}" found in body` : `"${primaryKeyword}" not found in body`) : "No primary keyword set" })

  const keywordInTitle = primaryKeyword ? title.toLowerCase().includes(primaryKeyword) : false
  checks.push({ label: "Keyword in title", passed: !primaryKeyword || keywordInTitle, detail: primaryKeyword ? (keywordInTitle ? "Keyword appears in the title" : "Keyword missing from title") : "No primary keyword set" })

  const hasCta = /\*\*.+\*\*$/m.test(body.trim()) || /\[.+\]/.test(body)
  checks.push({ label: "Has a call to action", passed: hasCta, detail: hasCta ? "CTA detected" : "No clear CTA found at the end" })

  const meaningfulWords = body.toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !STOP_WORDS.has(w))
  const density = primaryKeyword ? meaningfulWords.filter((w) => w.includes(primaryKeyword.split(" ")[0])).length / Math.max(meaningfulWords.length, 1) : 0
  const densityOk = !primaryKeyword || (density > 0 && density < 0.06)
  checks.push({ label: "Healthy keyword density", passed: densityOk, detail: primaryKeyword ? `${(density * 100).toFixed(1)}% density` : "No primary keyword set" })

  const passedCount = checks.filter((c) => c.passed).length
  const score = Math.round((passedCount / checks.length) * 100)

  return { score, checks }
}
