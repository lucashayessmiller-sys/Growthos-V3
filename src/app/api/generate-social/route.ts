import { NextRequest, NextResponse } from "next/server"
import type { SocialBrief } from "@/lib/types"
import { mockGenerateSocial } from "@/lib/ai/social-generate"
import { PLATFORMS } from "@/lib/platforms"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(brief: SocialBrief, regenerateNote?: string) {
  const platform = PLATFORMS[brief.platform]
  return `You are a senior social media copywriter working inside GrowthOS AI.

Write a ${platform.label} caption for the following brief. Respond with ONLY valid JSON in this exact shape, no markdown fences, no preamble:
{"caption": "the caption text, without hashtags", "hashtags": ["tag1", "tag2"]}

Topic: ${brief.topic}
Platform: ${platform.label} (character limit ${platform.charLimit}, hashtag guidance: ${platform.hashtagGuidance})
Media type: ${brief.mediaType}
Target audience: ${brief.audience || "general audience"}
Tone: ${brief.tone}
Number of hashtags: ${brief.hashtagCount}
Call to action: ${brief.cta || "use your best judgment"}
${brief.notes ? `Additional notes: ${brief.notes}` : ""}
${regenerateNote ? `\nThe previous draft needs revision. Specific feedback: ${regenerateNote}` : ""}`
}

export async function POST(req: NextRequest) {
  try {
    const { brief, regenerateNote } = (await req.json()) as { brief: SocialBrief; regenerateNote?: string }

    if (!brief?.topic || !brief?.platform) {
      return NextResponse.json({ error: "A brief with at least a topic and platform is required." }, { status: 400 })
    }

    const cacheKey = regenerateNote ? undefined : `social:${brief.platform}:${brief.topic}:${brief.tone}`.toLowerCase()

    const result = await ai.generate({
      task: "social.caption",
      prompt: buildPrompt(brief, regenerateNote),
      maxTokens: 700,
      cacheKey,
      fallback: () => JSON.stringify(mockGenerateSocial(brief, regenerateNote)),
    })

    // Deterministic fallback returns JSON directly; the AI provider is asked
    // to also return JSON, but may wrap it in prose despite instructions —
    // parse defensively and fall back to a plain-caption shape if needed.
    try {
      const cleaned = result.text.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      if (parsed.caption) {
        return NextResponse.json({ caption: parsed.caption, hashtags: parsed.hashtags ?? [], source: result.provider })
      }
    } catch {
      // fall through
    }
    return NextResponse.json({ caption: result.text, hashtags: [], source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
