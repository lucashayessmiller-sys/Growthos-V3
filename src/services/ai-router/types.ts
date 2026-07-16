export type AITaskType =
  | "content.blog" | "content.email" | "content.ad" | "content.landing"
  | "content.case-study" | "content.newsletter" | "content.social" | "social.caption" | "analytics.digest" | "seo.keywords" | "reputation.response" | "competitor.digest" | "brand.digest" | "local.description" | "ads.copy" | "creative.headline" | "cmo.brief"

export interface AIGenerateRequest {
  task: AITaskType
  prompt: string
  maxTokens?: number
  /** Stable key used for response caching. Omit to skip caching. */
  cacheKey?: string
  /** Org id, for future per-org rate limiting / usage attribution. */
  orgId?: string
}

export interface AIGenerateResult {
  text: string
  /** Which provider actually produced this response. */
  provider: "anthropic" | "deterministic-fallback" | "cache"
  /** Rough token/cost estimate — 0 for deterministic/cache responses. */
  estimatedInputTokens: number
  estimatedOutputTokens: number
  cached: boolean
}

export interface AIProvider {
  id: "anthropic"
  isConfigured(): boolean
  generate(req: AIGenerateRequest): Promise<{ text: string; inputTokens: number; outputTokens: number }>
}
