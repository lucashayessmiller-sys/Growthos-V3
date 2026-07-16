import type { Competitor } from "@/lib/types"

// Sample competitor data. There's no live SEMrush/Ahrefs/SimilarWeb
// integration wired up (all require paid API access), so this generates a
// stable, seeded set — clearly labeled everywhere it's shown. Swap-in
// point for a real integration: replace generateCompetitors() with a
// query against your data provider, keeping the same Competitor shape.
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

const COMPETITOR_PROFILES = [
  { name: "Basecamp Outfitters", domain: "basecampoutfitters.com", keywords: ["hiking backpacks", "camping tents", "trail maps", "outdoor apparel"] },
  { name: "Ridgeline Supply Co.", domain: "ridgelinesupply.com", keywords: ["winter jackets", "insulated boots", "base layers", "gear rental"] },
  { name: "Trailhead & Co.", domain: "trailheadandco.com", keywords: ["trail running shoes", "hydration packs", "ultralight gear", "gear reviews"] },
  { name: "Summit Gear Exchange", domain: "summitgearexchange.com", keywords: ["used outdoor gear", "gear trade-in", "budget hiking gear", "sustainability"] },
]

export function generateCompetitors(orgSeed: string): Competitor[] {
  return COMPETITOR_PROFILES.map((profile, i) => {
    const rand = seededRandom(orgSeed + profile.domain)
    return {
      id: `comp_${i + 1}`,
      name: profile.name,
      domain: profile.domain,
      estMonthlyTraffic: Math.round((8000 + rand() * 42000) / 100) * 100,
      domainAuthority: Math.round(25 + rand() * 45),
      socialFollowers: Math.round((3000 + rand() * 60000) / 100) * 100,
      adSpendEstimate: Math.round((800 + rand() * 9000) / 50) * 50,
      topKeywords: profile.keywords,
    }
  })
}
