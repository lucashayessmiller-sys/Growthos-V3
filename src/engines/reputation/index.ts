// Deterministic sentiment classification and review aggregation — rating +
// keyword heuristics only, no AI call needed for this kind of scoring.
export type Sentiment = "positive" | "neutral" | "negative"

const NEGATIVE_WORDS = ["broke", "rude", "slow", "disappointed", "refund", "never again", "waste", "poor", "terrible", "worst"]
const POSITIVE_WORDS = ["love", "amazing", "excellent", "fantastic", "best", "great", "helpful", "perfect", "recommend"]

export function computeSentiment(rating: number, text: string): Sentiment {
  const lower = text.toLowerCase()
  const negHits = NEGATIVE_WORDS.filter((w) => lower.includes(w)).length
  const posHits = POSITIVE_WORDS.filter((w) => lower.includes(w)).length

  if (rating <= 2 || negHits > posHits) return "negative"
  if (rating >= 4 && negHits === 0) return "positive"
  if (rating === 3 || (negHits === posHits && negHits > 0)) return "neutral"
  return posHits > negHits ? "positive" : "neutral"
}

export interface ReviewStats {
  total: number
  avgRating: number
  ratingDistribution: { rating: number; count: number }[]
  responseRate: number
  sentiment: { positive: number; neutral: number; negative: number }
  byPlatform: { platform: string; count: number; avgRating: number }[]
}

export interface StatsInputReview {
  rating: number
  sentiment: Sentiment
  platform: string
  hasResponse: boolean
}

export function computeReviewStats(reviews: StatsInputReview[]): ReviewStats {
  const total = reviews.length
  const avgRating = total ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((r) => r.rating === rating).length }))

  const responded = reviews.filter((r) => r.hasResponse).length
  const responseRate = total ? Math.round((responded / total) * 100) : 0

  const sentiment = {
    positive: reviews.filter((r) => r.sentiment === "positive").length,
    neutral: reviews.filter((r) => r.sentiment === "neutral").length,
    negative: reviews.filter((r) => r.sentiment === "negative").length,
  }

  const platforms = [...new Set(reviews.map((r) => r.platform))]
  const byPlatform = platforms.map((platform) => {
    const forPlatform = reviews.filter((r) => r.platform === platform)
    return {
      platform,
      count: forPlatform.length,
      avgRating: Math.round((forPlatform.reduce((s, r) => s + r.rating, 0) / forPlatform.length) * 10) / 10,
    }
  }).sort((a, b) => b.count - a.count)

  return { total, avgRating, ratingDistribution, responseRate, sentiment, byPlatform }
}
