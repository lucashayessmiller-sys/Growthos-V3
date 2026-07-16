import { NextRequest, NextResponse } from "next/server"
import type { ContentBrief } from "@/lib/types"
import { mockGenerate } from "@/lib/ai/generate"
import { ai } from "@/services/ai-router"
import type { AITaskType } from "@/services/ai-router/types"

export const runtime = "nodejs"

const taskByType: Record<ContentBrief["type"], AITaskType> = {
  blog: "content.blog",
  email: "content.email",
  ad: "content.ad",
  landing: "content.landing",
  "case-study": "content.case-study",
  newsletter: "content.newsletter",
  social: "content.social",
}

function buildPrompt(brief: ContentBrief, regenerateNote?: string) {
  const lengthGuide = { short: "150-200 words", medium: "350-500 words", long: "700-900 words" }[brief.length]
  return `You are a senior marketing copywriter working inside GrowthOS AI, a marketing operations platform.

Write a ${brief.type.replace("-", " ")} for the following brief. Return only the finished copy, formatted in markdown where appropriate — no preamble, no explanation.

Topic: ${brief.topic}
Target audience: ${brief.audience || "general business audience"}
Tone: ${brief.tone}
Target length: ${lengthGuide}
Keywords to incorporate naturally: ${brief.keywords.join(", ") || "none specified"}
Call to action: ${brief.cta || "use your best judgment"}
${brief.notes ? `Additional notes: ${brief.notes}` : ""}
${regenerateNote ? `\nThe previous draft needs revision. Specific feedback: ${regenerateNote}` : ""}`
}

export async function POST(req: NextRequest) {
  try {
    const { brief, regenerateNote } = (await req.json()) as { brief: ContentBrief; regenerateNote?: string }

    if (!brief?.topic || !brief?.type) {
      return NextResponse.json({ error: "A brief with at least a topic and type is required." }, { status: 400 })
    }

    // Regeneration requests are intentionally never cached — the person is
    // explicitly asking for something different from what they got last time.
    const cacheKey = regenerateNote ? undefined : `content:${brief.type}:${brief.topic}:${brief.tone}:${brief.length}`.toLowerCase()

    const result = await ai.generate({
      task: taskByType[brief.type],
      prompt: buildPrompt(brief, regenerateNote),
      maxTokens: 1400,
      cacheKey,
      fallback: () => mockGenerate(brief, regenerateNote),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
