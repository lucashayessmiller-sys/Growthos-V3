import type { AIProvider } from "./types"

const MODEL = "claude-sonnet-4-6"

export const anthropicProvider: AIProvider = {
  id: "anthropic",
  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY
  },
  async generate({ prompt, maxTokens = 1000 }) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const text: string =
      data.content?.map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n") ?? ""

    if (!text) throw new Error("Anthropic API returned no text content")

    return {
      text,
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    }
  },
}
