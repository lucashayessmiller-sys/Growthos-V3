import type { BusinessSnapshot } from "@/lib/data/cmo"

export async function generateCmoBrief(snapshot: BusinessSnapshot, regenerateNote?: string): Promise<string> {
  const res = await fetch("/api/generate-cmo-brief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot, regenerateNote }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

// Deterministic fallback: a structured brief built entirely from real
// signal values, never inventing a number that isn't in the snapshot.
export function mockCmoBrief(snapshot: BusinessSnapshot): string {
  const attention = snapshot.signals.filter((s) => s.status === "attention")
  const good = snapshot.signals.filter((s) => s.status === "good")

  const lines: string[] = []
  lines.push("# Weekly Strategic Brief\n")
  lines.push("## Where things stand\n")
  lines.push(
    `${good.length} of ${snapshot.signals.length} tracked areas are in good shape${good.length ? `: ${good.map((s) => s.module).join(", ")}.` : "."} ` +
    (attention.length ? `${attention.length} area${attention.length === 1 ? "" : "s"} need${attention.length === 1 ? "s" : ""} attention: ${attention.map((s) => s.module).join(", ")}.` : "Nothing is flagged as urgent this week.")
  )
  lines.push("\n## Top priorities\n")
  const priorities = (attention.length ? attention : snapshot.signals.filter((s) => s.status === "watch")).slice(0, 3)
  if (priorities.length === 0) {
    lines.push("- Maintain current pace across all modules — no urgent gaps found this week.")
  } else {
    for (const p of priorities) {
      lines.push(`- **${p.module}**: ${p.label} is at ${p.value} (${p.detail}). Worth a closer look this week.`)
    }
  }
  lines.push("\n## Everything else at a glance\n")
  for (const s of snapshot.signals) {
    lines.push(`- ${s.module}: ${s.label} — ${s.value} (${s.detail})`)
  }
  return lines.join("\n")
}
