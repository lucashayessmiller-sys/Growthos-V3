import { anthropicProvider } from "./anthropic-provider"
import { getCached, setCached } from "./cache"
import type { AIGenerateRequest, AIGenerateResult } from "./types"

// Every module in GrowthOS AI must call ai.generate() rather than reaching
// out to a provider SDK directly. This keeps provider choice, caching,
// rate limiting, and cost controls in exactly one place. Modules pass a
// `fallback` — a deterministic, template-based generator — so the product
// stays fully functional (and free to run) with zero AI provider configured.
export const ai = {
  async generate(req: AIGenerateRequest & { fallback: () => string }): Promise<AIGenerateResult> {
    const { cacheKey, fallback } = req

    if (cacheKey) {
      const cached = getCached(cacheKey)
      if (cached) {
        return { text: cached, provider: "cache", estimatedInputTokens: 0, estimatedOutputTokens: 0, cached: true }
      }
    }

    if (anthropicProvider.isConfigured()) {
      try {
        const result = await anthropicProvider.generate(req)
        if (cacheKey) setCached(cacheKey, result.text)
        logUsage(req, "anthropic", result.inputTokens, result.outputTokens)
        return {
          text: result.text,
          provider: "anthropic",
          estimatedInputTokens: result.inputTokens,
          estimatedOutputTokens: result.outputTokens,
          cached: false,
        }
      } catch (err) {
        // Provider failed (rate limit, outage, bad key) — degrade gracefully
        // to the deterministic fallback rather than breaking the module.
        console.error(`[ai-router] ${anthropicProvider.id} failed, falling back:`, err)
      }
    }

    const text = fallback()
    if (cacheKey) setCached(cacheKey, text)
    logUsage(req, "deterministic-fallback", 0, 0)
    return { text, provider: "deterministic-fallback", estimatedInputTokens: 0, estimatedOutputTokens: 0, cached: false }
  },
}

// Placeholder usage log — swap for a Supabase `ai_usage` insert once a
// project is connected. Kept as a pure function so call sites never change.
function logUsage(req: AIGenerateRequest, provider: string, inputTokens: number, outputTokens: number) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[ai-router] task=${req.task} provider=${provider} in=${inputTokens} out=${outputTokens} org=${req.orgId ?? "demo"}`)
  }
}
