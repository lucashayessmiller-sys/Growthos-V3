import type { Review, ReviewPlatform } from "@/lib/types"
import { computeSentiment } from "@/engines/reputation"

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

const PLATFORMS: ReviewPlatform[] = ["google", "yelp", "facebook", "tripadvisor"]
const LOCATIONS = ["Collingwood store", "Blue Mountain outlet", "Online order"]
const AUTHORS = [
  "Megan T.", "Derek W.", "Priya N.", "Sam R.", "Jordan K.", "Aisha M.", "Chris B.", "Lauren F.",
  "Tom H.", "Nadia S.", "Ben O.", "Katie L.", "Marcus P.", "Ellie J.",
]

const POSITIVE_TEMPLATES = [
  "The staff spent twenty minutes helping me find the right boot fit — no rush, no upsell pressure. Left with exactly what I needed.",
  "Ordered online and it shipped the same day. The jacket fits perfectly and held up great on a rainy weekend hike.",
  "Best gear shop in the area, hands down. Knowledgeable staff and they actually use the products they sell.",
  "Love this store. Found a great deal on trekking poles and the return policy gave me peace of mind.",
  "Excellent selection for the price point. My go-to for anything trail-related now.",
]
const NEUTRAL_TEMPLATES = [
  "Decent selection but a bit pricier than I expected. Staff were fine, nothing special either way.",
  "Order took a little longer than the estimate but customer service was responsive when I asked.",
  "Good store overall, just wish they carried more women's sizing in the boot lineup.",
]
const NEGATIVE_TEMPLATES = [
  "Waited almost 20 minutes before anyone helped me on a weekday afternoon. Product was fine once I got it.",
  "Ordered a jacket that arrived with a broken zipper. Refund process took over a week, which was disappointing.",
  "Website said in stock but I got an email two days later saying it wasn't. Wish that was clearer upfront.",
]

export function generateReviews(orgSeed: string, count = 14): Review[] {
  const rand = seededRandom(orgSeed + "-reviews")
  const reviews: Review[] = []

  for (let i = 0; i < count; i++) {
    const roll = rand()
    // Weighted toward positive, like most real review distributions.
    const rating = roll < 0.55 ? 5 : roll < 0.75 ? 4 : roll < 0.85 ? 3 : roll < 0.94 ? 2 : 1
    const templates = rating >= 4 ? POSITIVE_TEMPLATES : rating === 3 ? NEUTRAL_TEMPLATES : NEGATIVE_TEMPLATES
    const text = templates[Math.floor(rand() * templates.length)]
    const daysAgo = Math.floor(rand() * 60)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    const author = AUTHORS[Math.floor(rand() * AUTHORS.length)]
    const sentiment = computeSentiment(rating, text)
    // Older, positive reviews are more likely to already be answered in a
    // typical inbox; newer/negative ones more likely to still need a reply.
    const status = daysAgo > 20 && rating >= 4 && rand() > 0.4 ? "responded" : rating <= 2 ? "needs_response" : rand() > 0.6 ? "responded" : "needs_response"

    reviews.push({
      id: `rev_${i + 1}`,
      platform: PLATFORMS[Math.floor(rand() * PLATFORMS.length)],
      authorName: author,
      authorInitials: author.split(" ").map((p) => p[0]).join(""),
      rating,
      text,
      date: date.toISOString(),
      location: LOCATIONS[Math.floor(rand() * LOCATIONS.length)],
      sentiment,
      status,
    })
  }

  return reviews.sort((a, b) => +new Date(b.date) - +new Date(a.date))
}
