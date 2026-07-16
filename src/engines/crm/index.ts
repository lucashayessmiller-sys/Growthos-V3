// Deterministic lead scoring and pipeline math — real signals from actual
// contact/deal records, no AI call needed for this kind of scoring.
import type { Contact, Deal, DealStage } from "@/lib/types"

export interface LeadScoreResult {
  score: number
  factors: { label: string; points: number }[]
}

const FREE_EMAIL_DOMAINS = new Set(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"])

export function computeLeadScore(contact: Contact, deals: Deal[]): LeadScoreResult {
  const factors: LeadScoreResult["factors"] = []
  const contactDeals = deals.filter((d) => d.contactId === contact.id)

  if (contact.company) factors.push({ label: "Has company", points: 15 })

  const emailDomain = contact.email.split("@")[1]?.toLowerCase()
  if (emailDomain && !FREE_EMAIL_DOMAINS.has(emailDomain)) factors.push({ label: "Business email domain", points: 15 })

  if (contact.phone) factors.push({ label: "Phone on file", points: 10 })

  const openDeals = contactDeals.filter((d) => d.stage !== "won" && d.stage !== "lost")
  if (openDeals.length > 0) factors.push({ label: "Active deal in pipeline", points: 25 })

  const totalValue = openDeals.reduce((s, d) => s + d.value, 0)
  if (totalValue > 5000) factors.push({ label: "High deal value", points: 20 })
  else if (totalValue > 1000) factors.push({ label: "Moderate deal value", points: 10 })

  const advancedStage = openDeals.some((d) => d.stage === "proposal" || d.stage === "negotiation")
  if (advancedStage) factors.push({ label: "Deal in late stage", points: 15 })

  if (contact.status === "customer") factors.push({ label: "Existing customer", points: 20 })

  const daysSinceUpdate = (Date.now() - new Date(contact.updatedAt).getTime()) / 86_400_000
  if (daysSinceUpdate < 7) factors.push({ label: "Recently active", points: 10 })

  const score = Math.min(100, factors.reduce((s, f) => s + f.points, 0))
  return { score, factors }
}

export interface PipelineStats {
  totalValue: number
  weightedValue: number
  winRate: number
  byStage: { stage: DealStage; count: number; value: number }[]
}

const STAGES: DealStage[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"]

export function computePipelineStats(deals: Deal[]): PipelineStats {
  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost")
  const totalValue = openDeals.reduce((s, d) => s + d.value, 0)
  const weightedValue = Math.round(openDeals.reduce((s, d) => s + d.value * (d.probability / 100), 0))

  const closedDeals = deals.filter((d) => d.stage === "won" || d.stage === "lost")
  const winRate = closedDeals.length ? Math.round((deals.filter((d) => d.stage === "won").length / closedDeals.length) * 100) : 0

  const byStage = STAGES.map((stage) => {
    const forStage = deals.filter((d) => d.stage === stage)
    return { stage, count: forStage.length, value: forStage.reduce((s, d) => s + d.value, 0) }
  })

  return { totalValue, weightedValue, winRate, byStage }
}
