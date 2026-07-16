import type { SocialBrief, SocialTone } from "@/lib/types"
import { PLATFORMS } from "@/lib/platforms"

export interface SocialGenerationResult {
  caption: string
  hashtags: string[]
}

export async function generateSocialCaption(brief: SocialBrief, regenerateNote?: string): Promise<SocialGenerationResult> {
  const res = await fetch("/api/generate-social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief, regenerateNote }),
  })
  if (!res.ok) throw new Error("Generation failed")
  return res.json()
}

const toneOpeners: Record<SocialTone, string[]> = {
  professional: ["A quick update on", "Here's what we're seeing with", "Worth noting:"],
  friendly: ["Let's talk about", "Here's the thing about", "Quick one for you on"],
  bold: ["Forget the old way of thinking about", "It's time to rethink", "Stop settling for average"],
  playful: ["Okay, real talk about", "Plot twist:", "So here's a fun one —"],
  authoritative: ["The data is clear on", "Here's what the numbers say about", "The results speak for themselves on"],
  empathetic: ["We know how it feels to think about", "If you've ever wondered about", "It's okay to still be figuring out"],
}

const hashtagBank = [
  "growth", "marketing", "smallbusiness", "outdoors", "trailready", "community", "newarrival",
  "shopnow", "behindthescenes", "customerlove", "sustainability", "craftsmanship", "weekendvibes",
]

function pick<T>(arr: T[], seed: number) { return arr[seed % arr.length] }
function hashSeed(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function mockGenerateSocial(brief: SocialBrief, regenerateNote?: string): SocialGenerationResult {
  const seed = hashSeed(brief.topic + brief.platform + (regenerateNote ?? "") + Date.now().toString().slice(-3))
  const opener = pick(toneOpeners[brief.tone], seed)
  const platform = PLATFORMS[brief.platform]

  let caption = `${opener} ${brief.topic.toLowerCase()}.`
  if (platform.id === "linkedin") {
    caption += `\n\nFor ${brief.audience || "teams like yours"}, this is more than a trend — it's a shift in how the best organizations operate.\n\n${brief.cta || "Curious how this applies to your team? Let's connect."}`
  } else if (platform.id === "x") {
    caption = `${opener} ${brief.topic.toLowerCase()}. ${brief.cta || ""}`.trim().slice(0, 260)
  } else {
    caption += `\n\n${brief.cta || "Tell us what you think in the comments 👇"}`
  }

  const hashtags = Array.from({ length: Math.min(brief.hashtagCount, hashtagBank.length) }, (_, i) => hashtagBank[(seed + i) % hashtagBank.length])

  return { caption, hashtags: [...new Set(hashtags)] }
}
