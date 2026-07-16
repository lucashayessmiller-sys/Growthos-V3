import type { Review } from "@/lib/types"

export async function generateReviewResponse(review: Review, regenerateNote?: string): Promise<string> {
  const res = await fetch("/api/generate-response", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ review, regenerateNote }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

export function mockReviewResponse(review: Review): string {
  const firstName = review.authorName.split(" ")[0]

  if (review.rating >= 4) {
    return `Hi ${firstName}, thank you so much for taking the time to share this! We're thrilled to hear about your experience at ${review.location} and that our team could help you find the right gear. See you on the trail!`
  }
  if (review.rating === 3) {
    return `Hi ${firstName}, thanks for the honest feedback. We're glad the core experience worked out, but we'd love to hear more about what would've made it a 5-star visit — feel free to reach out to us directly so we can make it right.`
  }
  return `Hi ${firstName}, we're sorry to hear about this experience — it's not the standard we hold ourselves to. We'd really like to make this right. Could you reach out to us directly at ${review.location.toLowerCase().includes("online") ? "support@northbound.co" : review.location} so we can help resolve this?`
}
