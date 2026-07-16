import { NextRequest, NextResponse } from "next/server"
import type { Review } from "@/lib/types"
import { mockReviewResponse } from "@/lib/ai/reputation-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(review: Review, regenerateNote?: string) {
  return `You are managing online reputation for Northbound Outfitters, an outdoor and lifestyle retailer. Write a warm, on-brand, specific reply to this customer review. Keep it under 80 words, no generic corporate language, address specifics from the review where relevant. Return only the reply text, no preamble.

Platform: ${review.platform}
Reviewer: ${review.authorName}
Rating: ${review.rating}/5
Location: ${review.location}
Review: "${review.text}"
${review.rating <= 3 ? "This is a lower rating — acknowledge the issue directly, apologize where warranted, and invite them to follow up privately. Don't be defensive." : "This is a positive review — be genuinely appreciative and specific, not generic."}
${regenerateNote ? `\nThe previous draft needs revision. Specific feedback: ${regenerateNote}` : ""}`
}

export async function POST(req: NextRequest) {
  try {
    const { review, regenerateNote } = (await req.json()) as { review: Review; regenerateNote?: string }
    if (!review?.id) return NextResponse.json({ error: "A review is required." }, { status: 400 })

    const result = await ai.generate({
      task: "reputation.response",
      prompt: buildPrompt(review, regenerateNote),
      maxTokens: 300,
      cacheKey: regenerateNote ? undefined : `response:${review.id}`,
      fallback: () => mockReviewResponse(review),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
