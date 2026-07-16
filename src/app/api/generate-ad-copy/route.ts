import { NextRequest, NextResponse } from "next/server"
import type { AdCampaign } from "@/lib/types"
import { mockAdCopy } from "@/lib/ai/ads-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

const PLATFORM_LIMITS: Record<AdCampaign["platform"], string> = {
  meta: "headline under 40 characters, primary text under 125 characters",
  google: "headline under 30 characters, description under 90 characters",
  tiktok: "short, punchy, native-feeling — avoid anything that reads like a traditional ad",
}

function buildPrompt(input: { name: string; platform: AdCampaign["platform"]; objective: AdCampaign["objective"]; targetAudience: string }) {
  return `You are a paid ads copywriter inside GrowthOS AI. Write ad copy for this campaign. Respond with ONLY valid JSON, no markdown fences, no preamble:
{"headline": "...", "body": "...", "cta": "..."}

Campaign: ${input.name}
Platform: ${input.platform} (${PLATFORM_LIMITS[input.platform]})
Objective: ${input.objective}
Target audience: ${input.targetAudience || "general audience"}
CTA should be a short button label (e.g. "Shop Now", "Learn More", "Get Started").`
}

export async function POST(req: NextRequest) {
  try {
    const { input } = (await req.json()) as { input: { name: string; platform: AdCampaign["platform"]; objective: AdCampaign["objective"]; targetAudience: string } }
    if (!input?.name) return NextResponse.json({ error: "A campaign name is required." }, { status: 400 })

    const result = await ai.generate({
      task: "ads.copy",
      prompt: buildPrompt(input),
      maxTokens: 300,
      fallback: () => JSON.stringify(mockAdCopy(input)),
    })

    try {
      const cleaned = result.text.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(cleaned)
      if (parsed.headline) return NextResponse.json(parsed)
    } catch {
      // fall through
    }
    return NextResponse.json(mockAdCopy(input))
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
