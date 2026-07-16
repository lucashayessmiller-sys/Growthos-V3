export async function generateHeadline(topic: string): Promise<string> {
  const res = await fetch("/api/generate-headline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

export function mockHeadline(topic: string): string {
  const templates = [`${topic} — done right.`, `Meet ${topic}.`, `${topic}, built to last.`, `Discover ${topic}.`]
  const seed = topic.split("").reduce((s, c) => s + c.charCodeAt(0), 0)
  return templates[seed % templates.length]
}
