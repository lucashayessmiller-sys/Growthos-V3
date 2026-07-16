import type { Location } from "@/lib/types"

export async function generateLocationDescription(location: Location): Promise<string> {
  const res = await fetch("/api/generate-location-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location }),
  })
  if (!res.ok) throw new Error("Generation failed")
  const data = await res.json()
  return data.text as string
}

export function mockLocationDescription(location: Location): string {
  const cityPart = location.city ? ` in ${location.city}` : ""
  return `Visit our ${location.name}${cityPart} for expert advice and hands-on gear fitting. ${location.hours ? `Open ${location.hours}.` : ""} ${location.phone ? `Call us at ${location.phone} with any questions.` : ""}`.trim()
}
