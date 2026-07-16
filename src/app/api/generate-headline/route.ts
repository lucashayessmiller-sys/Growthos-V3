import { NextRequest, NextResponse } from "next/server"
import { mockHeadline } from "@/lib/ai/creative-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { topic } = (await req.json()) as { topic: string }
    if (!topic?.trim()) return NextResponse.json({ error: "A topic is required." }, { status: 400 })

    const result = await ai.generate({
      task: "creative.headline",
      prompt: `Write one short, punchy headline (under 8 words) for a marketing graphic about: "${topic}". Return only the headline text, no quotes, no punctuation at the end unless it's an exclamation point.`,
      maxTokens: 40,
      fallback: () => mockHeadline(topic),
    })

    return NextResponse.json({ text: result.text.trim().replace(/^"|"$/g, "") })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
