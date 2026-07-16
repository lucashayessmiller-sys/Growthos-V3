export interface KeywordOpportunity {
  keyword: string
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational"
  estDifficulty: "Low" | "Medium" | "High"
  rationale: string
}

export async function generateKeywordOpportunities(topic: string): Promise<KeywordOpportunity[]> {
  const res = await fetch("/api/generate-keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.keywords as KeywordOpportunity[]
}

const INTENTS: KeywordOpportunity["intent"][] = ["Informational", "Commercial", "Transactional", "Navigational"]
const DIFFICULTIES: KeywordOpportunity["estDifficulty"][] = ["Low", "Medium", "High"]
const MODIFIERS = ["best", "how to choose", "vs", "for beginners", "buying guide", "near me", "reviews", "checklist"]

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

// Deterministic fallback: real keyword research needs a live SERP/volume
// data source. This builds plausible long-tail variants from the topic
// using common modifier patterns, clearly framed as AI-estimated
// suggestions to validate — not a substitute for Search Console/SERP data.
export function mockKeywordOpportunities(topic: string): KeywordOpportunity[] {
  const rand = seededRandom(topic)
  return MODIFIERS.slice(0, 6).map((mod) => {
    const keyword = mod === "vs" ? `${topic} vs alternatives` : mod === "near me" ? `${topic} near me` : `${mod} ${topic}`
    return {
      keyword,
      intent: INTENTS[Math.floor(rand() * INTENTS.length)],
      estDifficulty: DIFFICULTIES[Math.floor(rand() * DIFFICULTIES.length)],
      rationale: `Long-tail variant built from the "${mod}" modifier pattern, commonly searched alongside "${topic}".`,
    }
  })
}
