// Sample keyword rank tracking. There is no live SERP-tracking integration
// wired up (that requires a paid third-party rank API), so this generates
// a stable, seeded time series per keyword — clearly labeled as sample
// data everywhere it's shown in the UI. Swap-in point for a real
// integration: replace generateTrackedKeywords() with a query against
// your rank-tracking provider, keeping the same TrackedKeyword shape.
export interface RankPoint {
  date: string
  position: number
}

export interface TrackedKeyword {
  keyword: string
  currentPosition: number
  change7d: number
  estMonthlySearches: number
  difficulty: "Low" | "Medium" | "High"
  history: RankPoint[]
}

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

const DIFFICULTIES: TrackedKeyword["difficulty"][] = ["Low", "Medium", "High"]

export function generateTrackedKeywords(seedBase: string, keywords: string[], days = 30): TrackedKeyword[] {
  return keywords.map((keyword) => {
    const rand = seededRandom(seedBase + keyword)
    const startPosition = Math.round(8 + rand() * 40)
    const history: RankPoint[] = []
    let position = startPosition
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      // Gentle random walk, biased slightly toward improving over time.
      position = Math.max(1, Math.min(100, position + Math.round((rand() - 0.56) * 3)))
      history.push({ date: date.toISOString().slice(0, 10), position })
    }

    const currentPosition = history[history.length - 1].position
    const change7d = history[Math.max(0, history.length - 8)].position - currentPosition

    return {
      keyword,
      currentPosition,
      change7d,
      estMonthlySearches: Math.round((200 + rand() * 4800) / 10) * 10,
      difficulty: DIFFICULTIES[Math.floor(rand() * DIFFICULTIES.length)],
      history,
    }
  })
}

// Default tracked keywords for a workspace with no explicit target
// keywords yet — pulled loosely from the demo org's category so the
// module never renders empty on first load.
export const DEFAULT_TRACKED_KEYWORDS = [
  "durable hiking gear", "winter trail running boots", "trail-tested equipment",
  "layering system for hiking", "outdoor gear return policy", "shoulder season jacket",
]
