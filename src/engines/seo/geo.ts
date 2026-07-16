// Deterministic "AI Generative Engine Optimization" readiness scoring.
// This does NOT check whether content actually appears in ChatGPT/
// Perplexity/Gemini answers — that would require live queries against
// those products, which isn't something this engine fakes. Instead it
// scores structural traits that are well-documented correlates of being
// citable by an answer engine (direct-answer openings, clear structure,
// scannable lists, appropriate length) — an honest proxy, not a claim
// about real-world AI search rankings.
export interface GeoCheck {
  label: string
  passed: boolean
  detail: string
}

export interface GeoReadinessResult {
  score: number
  checks: GeoCheck[]
}

export function scoreGeoReadiness(body: string, title: string): GeoReadinessResult {
  const checks: GeoCheck[] = []
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const firstParagraph = paragraphs.find((p) => !p.startsWith("#")) ?? ""

  const directAnswerOpening = firstParagraph.length > 0 && firstParagraph.length < 400 && !firstParagraph.startsWith("#")
  checks.push({
    label: "Direct-answer opening",
    passed: directAnswerOpening,
    detail: directAnswerOpening ? "Opens with a concise, quotable paragraph" : "Opening paragraph is missing or too long to quote directly",
  })

  const hasQA = /\?\s*\n/.test(body) || /^#{2,3}\s+.+\?/m.test(body)
  checks.push({ label: "Question-and-answer structure", passed: hasQA, detail: hasQA ? "Contains explicit question-style headings" : "No question-style headings found — these are commonly lifted into AI answers" })

  const headings = (body.match(/^#{1,3}\s+.+/gm) ?? []).length
  const clearHierarchy = headings >= 2
  checks.push({ label: "Clear heading hierarchy", passed: clearHierarchy, detail: `${headings} heading(s) found` })

  const hasList = /^[-*]\s+.+/m.test(body) || /^\d+\.\s+.+/m.test(body)
  checks.push({ label: "Scannable list or steps", passed: hasList, detail: hasList ? "Contains a bulleted or numbered list" : "No list structure found" })

  const wordCount = body.split(/\s+/).filter(Boolean).length
  const goodLength = wordCount >= 250 && wordCount <= 1600
  checks.push({ label: "AI-summarizable length", passed: goodLength, detail: `${wordCount} words` })

  const titleIsQuestionOrClear = title.length > 10 && title.length < 90
  checks.push({ label: "Clear, specific title", passed: titleIsQuestionOrClear, detail: `${title.length} characters` })

  const passedCount = checks.filter((c) => c.passed).length
  return { score: Math.round((passedCount / checks.length) * 100), checks }
}
