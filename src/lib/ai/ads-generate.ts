import type { AdCampaign } from "@/lib/types"

export interface AdCopyResult {
  headline: string
  body: string
  cta: string
}

export async function generateAdCopy(input: { name: string; platform: AdCampaign["platform"]; objective: AdCampaign["objective"]; targetAudience: string }): Promise<AdCopyResult> {
  const res = await fetch("/api/generate-ad-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  })
  if (!res.ok) throw new Error("Generation failed")
  return res.json()
}

const OBJECTIVE_CTA: Record<AdCampaign["objective"], string> = {
  awareness: "Learn More", traffic: "Shop Now", conversions: "Get Started", leads: "Sign Up",
}

export function mockAdCopy(input: { name: string; targetAudience: string; objective: AdCampaign["objective"] }): AdCopyResult {
  return {
    headline: input.name.length <= 40 ? input.name : input.name.slice(0, 37) + "...",
    body: `Built for ${input.targetAudience || "people who care about quality"}. See why it's worth a look.`,
    cta: OBJECTIVE_CTA[input.objective],
  }
}
