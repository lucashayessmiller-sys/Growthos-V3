import { NextRequest, NextResponse } from "next/server"
import type { BusinessSnapshot } from "@/lib/data/cmo"
import { mockCmoBrief } from "@/lib/ai/cmo-generate"
import { ai } from "@/services/ai-router"

export const runtime = "nodejs"

function buildPrompt(snapshot: BusinessSnapshot, regenerateNote?: string) {
  return `You are the AI CMO inside GrowthOS AI, writing a weekly strategic brief for a business owner. Use only the real signals below — never invent a number or metric that isn't listed. Write in markdown with three sections: "## Where things stand" (2-3 sentence summary), "## Top priorities" (a short bulleted list of the 2-4 most important actions, referencing specific modules and numbers), and "## Everything else at a glance" (one line per remaining signal). Be direct and specific, not generic.

Signals (module, metric, value, detail, status):
${snapshot.signals.map((s) => `- ${s.module}: ${s.label} = ${s.value} (${s.detail}) — status: ${s.status}`).join("\n")}
${regenerateNote ? `\nThe previous brief needs revision. Specific feedback: ${regenerateNote}` : ""}`
}

export async function POST(req: NextRequest) {
  try {
    const { snapshot, regenerateNote } = (await req.json()) as { snapshot: BusinessSnapshot; regenerateNote?: string }
    if (!snapshot?.signals) return NextResponse.json({ error: "A business snapshot is required." }, { status: 400 })

    const result = await ai.generate({
      task: "cmo.brief",
      prompt: buildPrompt(snapshot, regenerateNote),
      maxTokens: 900,
      fallback: () => mockCmoBrief(snapshot),
    })

    return NextResponse.json({ text: result.text, source: result.provider })
  } catch {
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 })
  }
}
