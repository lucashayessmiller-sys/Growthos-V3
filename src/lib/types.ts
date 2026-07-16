import type { Platform } from "@/lib/platforms"

export type ContentType = "blog" | "social" | "email" | "ad" | "landing" | "case-study" | "newsletter"
export type ContentStatus = "draft" | "in_review" | "approved" | "scheduled" | "published"
export type Tone = "professional" | "friendly" | "bold" | "playful" | "authoritative" | "empathetic"

export interface ContentVersion {
  id: string
  createdAt: string
  body: string
  wordCount: number
  note: string
  generatedBy: "ai" | "human"
}

export interface ContentBrief {
  topic: string
  type: ContentType
  tone: Tone
  audience: string
  keywords: string[]
  length: "short" | "medium" | "long"
  cta: string
  notes?: string
}

export interface ContentPiece {
  id: string
  title: string
  type: ContentType
  status: ContentStatus
  brief: ContentBrief
  activeVersionId: string
  versions: ContentVersion[]
  seoScore: number
  readabilityScore: number
  campaign: string
  owner: string
  createdAt: string
  updatedAt: string
  scheduledFor?: string
  tags: string[]
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: "Starter" | "Growth" | "Scale" | "Enterprise"
  logoInitials: string
  industry: string
}

export interface WorkspaceUser {
  id: string
  name: string
  email: string
  role: "Owner" | "Admin" | "Editor" | "Contributor" | "Viewer"
  avatarInitials: string
}

// ---- Social Media Manager ----

export type SocialStatus = "draft" | "in_review" | "approved" | "scheduled" | "published"
export type SocialTone = "professional" | "friendly" | "bold" | "playful" | "authoritative" | "empathetic"
export type MediaType = "image" | "carousel" | "video" | "text"

export interface SocialBrief {
  topic: string
  platform: Platform
  tone: SocialTone
  mediaType: MediaType
  audience: string
  hashtagCount: number
  cta: string
  notes?: string
}

export interface SocialVersion {
  id: string
  createdAt: string
  caption: string
  hashtags: string[]
  note: string
  generatedBy: "ai" | "human"
}

export interface EngagementStats {
  likes: number
  comments: number
  shares: number
  reach: number
  saves: number
}

export interface SocialPost {
  id: string
  title: string
  platform: Platform
  mediaType: MediaType
  status: SocialStatus
  brief: SocialBrief
  activeVersionId: string
  versions: SocialVersion[]
  campaign: string
  owner: string
  createdAt: string
  updatedAt: string
  scheduledFor?: string
  publishedAt?: string
  engagement?: EngagementStats
  tags: string[]
}

// ---- Reputation Manager ----
export type ReviewPlatform = "google" | "yelp" | "facebook" | "tripadvisor"
export type ReviewStatus = "needs_response" | "responded" | "flagged"

export interface Review {
  id: string
  platform: ReviewPlatform
  authorName: string
  authorInitials: string
  rating: number
  text: string
  date: string
  location: string
  sentiment: "positive" | "neutral" | "negative"
  status: ReviewStatus
}

// ---- Competitor Intelligence ----
export interface Competitor {
  id: string
  name: string
  domain: string
  estMonthlyTraffic: number
  domainAuthority: number
  socialFollowers: number
  adSpendEstimate: number
  topKeywords: string[]
}

// ---- CRM + Lead Engine ----
export type ContactStatus = "lead" | "qualified" | "customer" | "churned"
export type DealStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost"

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: ContactStatus
  source: string
  tags: string[]
  notes: string
  owner: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  contactId: string | null
  title: string
  value: number
  stage: DealStage
  probability: number
  expectedCloseDate: string | null
  notes: string
  owner: string
  createdAt: string
  updatedAt: string
}

// ---- Brand Guardian ----
export interface PreferredTerm {
  wrong: string
  right: string
}

export interface BrandKit {
  tone: string
  bannedWords: string[]
  preferredTerms: PreferredTerm[]
  requiredDisclaimer: string
  requireDisclaimerFor: ContentType[]
}

export type ComplianceSeverity = "error" | "warning"

export interface ComplianceIssue {
  severity: ComplianceSeverity
  message: string
}

export interface ComplianceResult {
  sourceId: string
  sourceType: "content" | "social"
  title: string
  href: string
  issues: ComplianceIssue[]
  passed: boolean
}

// ---- Local Marketing Suite ----
export type LocationStatus = "active" | "inactive"

export interface Location {
  id: string
  name: string
  address: string
  city: string
  region: string
  postalCode: string
  phone: string
  hours: string
  status: LocationStatus
  description: string
  createdAt: string
  updatedAt: string
}

// ---- Paid Ads Manager ----
export type AdPlatform = "meta" | "google" | "tiktok"
export type AdObjective = "awareness" | "traffic" | "conversions" | "leads"
export type AdCampaignStatus = "draft" | "active" | "paused" | "ended"

export interface AdCampaign {
  id: string
  name: string
  platform: AdPlatform
  objective: AdObjective
  status: AdCampaignStatus
  budgetDaily: number
  startDate: string | null
  endDate: string | null
  targetAudience: string
  headline: string
  body: string
  cta: string
  notes: string
  owner: string
  createdAt: string
  updatedAt: string
}

// ---- Creative Studio ----
export type LayerType = "text" | "rect" | "circle"

export interface BaseLayer {
  id: string
  type: LayerType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
}

export interface TextLayer extends BaseLayer {
  type: "text"
  text: string
  fontSize: number
  fontFamily: "display" | "sans"
  color: string
  fontWeight: 400 | 500 | 600 | 700
  align: "left" | "center" | "right"
}

export interface ShapeLayer extends BaseLayer {
  type: "rect" | "circle"
  fill: string
}

export type DesignLayer = TextLayer | ShapeLayer

export interface CreativeDesign {
  id: string
  name: string
  canvasWidth: number
  canvasHeight: number
  layers: DesignLayer[]
  thumbnailDataUrl: string | null
  owner: string
  createdAt: string
  updatedAt: string
}
