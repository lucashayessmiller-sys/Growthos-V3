import type { ContentBrief, ContentType, Tone } from "@/lib/types"

// Client-side helper that calls our server route, which in turn
// calls the Anthropic API if ANTHROPIC_API_KEY is configured, and
// otherwise falls back to a deterministic local generator so the
// product is fully interactive in demo/eval environments.
export async function generateContent(brief: ContentBrief, regenerateNote?: string): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brief, regenerateNote }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

const toneOpeners: Record<Tone, string[]> = {
  professional: ["In today's competitive landscape,", "Organizations that succeed with", "A clear-eyed look at"],
  friendly: ["Let's talk about", "Here's the thing about", "You've probably wondered about"],
  bold: ["Forget everything you know about", "It's time to rethink", "The old playbook for"],
  playful: ["Okay, real talk about", "So here's a fun fact about", "Buckle up, because"],
  authoritative: ["The data is unambiguous:", "Industry leaders agree that", "Every credible analysis of"],
  empathetic: ["We know how hard it can be to", "If you've ever struggled with", "It's completely normal to wonder about"],
}

const lengthWordTargets: Record<ContentBrief["length"], number> = { short: 180, medium: 420, long: 850 }

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const typeSkeletons: Record<ContentType, (b: ContentBrief, seed: number) => string> = {
  blog: (b, seed) => {
    const opener = pick(toneOpeners[b.tone], seed)
    const kw = b.keywords[0] ?? b.topic
    return `# ${b.topic}

${opener} ${b.topic.toLowerCase()}. For ${b.audience || "growth-focused teams"}, this isn't a nice-to-have — it's becoming table stakes.

## Why ${kw} matters right now

Three shifts are converging: buyer expectations are rising, channels are fragmenting, and the cost of a generic message keeps climbing. Teams that treat ${kw} as a core discipline — not a campaign — are pulling ahead.

## A practical framework

1. **Diagnose** — audit where ${kw} is currently underperforming against benchmark.
2. **Prioritize** — rank opportunities by effort vs. projected impact on pipeline.
3. **Execute** — ship the highest-leverage change first, measure, iterate weekly.
4. **Compound** — bake the winning pattern into your standard operating process.

## What good looks like

The organizations getting the most out of ${kw} share a few habits: they instrument everything, they review results on a fixed cadence, and they treat every asset as a hypothesis rather than a finished deliverable.

## Bringing it together

${b.topic} rewards teams that move deliberately rather than quickly. Start with the diagnostic, be honest about what the data shows, and build from there.

${b.cta ? `**${b.cta}**` : ""}`
  },
  social: (b, seed) => {
    const opener = pick(toneOpeners[b.tone], seed)
    return `${opener} ${b.topic.toLowerCase()} 👇

${b.keywords.slice(0, 3).map((k) => `→ ${k}`).join("\n")}

${b.cta || "Learn more in the link below."}

#${b.keywords[0]?.replace(/\s+/g, "") || "marketing"} #growth`
  },
  email: (b, seed) => {
    const opener = pick(toneOpeners[b.tone], seed)
    return `Subject: ${b.topic}

Hi {{first_name}},

${opener} ${b.topic.toLowerCase()} — and why it matters for ${b.audience || "teams like yours"} right now.

Here's what's changed:
- The bar for relevance has gone up
- Generic messaging is getting tuned out
- The teams winning are the ones personalizing at scale

${b.cta || "Ready to see how this applies to your team?"}

Best,
The Team`
  },
  ad: (b, seed) => {
    return `**Headline:** ${b.topic}
**Primary text:** ${pick(toneOpeners[b.tone], seed)} ${b.topic.toLowerCase()}. Built for ${b.audience || "modern teams"}.
**CTA:** ${b.cta || "Get Started"}`
  },
  landing: (b, seed) => {
    const opener = pick(toneOpeners[b.tone], seed)
    return `# ${b.topic}

### ${opener} ${b.topic.toLowerCase()}

Built for ${b.audience || "teams that move fast"}.

**Why teams choose us**
- Faster time to value
- Proven results across ${b.keywords[0] || "your category"}
- Support that actually responds

[${b.cta || "Get Started"}]`
  },
  "case-study": (b, seed) => {
    return `# ${b.topic}

## The challenge
${b.audience || "The customer"} needed to improve ${b.keywords[0] || "performance"} without adding headcount.

## The approach
${pick(toneOpeners[b.tone], seed)} a focused, phased rollout centered on ${b.keywords.join(", ") || "the core workflow"}.

## The results
Measurable gains within the first quarter, with the team reporting meaningfully less manual work.

${b.cta ? `**${b.cta}**` : ""}`
  },
  newsletter: (b, seed) => {
    return `# ${b.topic}

${pick(toneOpeners[b.tone], seed)} ${b.topic.toLowerCase()}. Here's what's worth your attention this week:

1. ${b.keywords[0] || "A key trend"} is reshaping how teams plan
2. Early data suggests the winners are moving faster on ${b.keywords[1] || "execution"}
3. What we're watching next

${b.cta || "Reply and let us know what you're seeing."}`
  },
}

export function mockGenerate(brief: ContentBrief, regenerateNote?: string): string {
  const seedBase = hashSeed(brief.topic + brief.type + (regenerateNote ?? "") + Date.now().toString().slice(-3))
  const body = typeSkeletons[brief.type](brief, seedBase)
  const target = lengthWordTargets[brief.length]
  const words = body.split(/\s+/)
  if (words.length > target * 1.6) return words.slice(0, Math.round(target * 1.6)).join(" ")
  return body
}
