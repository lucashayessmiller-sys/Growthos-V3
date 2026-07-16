import {
  Sparkles, Search, FileText, Palette, Video, Globe, Share2, Megaphone,
  Star, Users, MapPin, BarChart3, ShieldCheck, Workflow, Radar,
  type LucideIcon,
} from "lucide-react"

export type ModuleStatus = "live" | "beta" | "soon"

export interface ModuleDef {
  slug: string
  name: string
  shortName: string
  description: string
  icon: LucideIcon
  status: ModuleStatus
  accent: "primary" | "growth" | "amber"
  group: "Command" | "Create" | "Distribute" | "Grow" | "Protect & Analyze"
}

export const MODULES: ModuleDef[] = [
  { slug: "ai-cmo", name: "AI CMO", shortName: "AI CMO", description: "Your always-on Chief Marketing Officer — strategy, planning, and cross-module orchestration.", icon: Sparkles, status: "live", accent: "primary", group: "Command" },
  { slug: "content-factory", name: "Content Factory", shortName: "Content", description: "Generate, edit, approve, and publish on-brand content at scale.", icon: FileText, status: "live", accent: "growth", group: "Create" },
  { slug: "creative-studio", name: "Creative Studio", shortName: "Creative", description: "AI-assisted design for ads, social graphics, and brand assets.", icon: Palette, status: "live", accent: "primary", group: "Create" },
  { slug: "video-studio", name: "Video Studio", shortName: "Video", description: "Script-to-video generation and editing for short-form and ads.", icon: Video, status: "soon", accent: "primary", group: "Create" },
  { slug: "website-builder", name: "AI Website Builder", shortName: "Website", description: "Spin up and optimize conversion-ready landing pages and sites.", icon: Globe, status: "soon", accent: "primary", group: "Create" },
  { slug: "social-media", name: "Social Media Manager", shortName: "Social", description: "Plan, generate, schedule, and analyze posts across every platform.", icon: Share2, status: "live", accent: "growth", group: "Distribute" },
  { slug: "paid-ads", name: "Paid Ads Manager", shortName: "Paid Ads", description: "Cross-channel campaign creation, budget pacing, and optimization.", icon: Megaphone, status: "live", accent: "primary", group: "Distribute" },
  { slug: "local-marketing", name: "Local Marketing Suite", shortName: "Local", description: "Listings, local SEO, and geo-targeted campaigns for multi-location brands.", icon: MapPin, status: "live", accent: "primary", group: "Distribute" },
  { slug: "seo-geo", name: "SEO + AI GEO Engine", shortName: "SEO / GEO", description: "Rank tracking, technical SEO, and visibility inside AI search & answer engines.", icon: Search, status: "live", accent: "growth", group: "Grow" },
  { slug: "crm", name: "CRM + Lead Engine", shortName: "CRM", description: "Pipeline, contacts, and AI lead scoring in one revenue workspace.", icon: Users, status: "live", accent: "primary", group: "Grow" },
  { slug: "automation", name: "Marketing Automation Builder", shortName: "Automation", description: "Visual workflow builder for lifecycle campaigns and triggers.", icon: Workflow, status: "soon", accent: "primary", group: "Grow" },
  { slug: "reputation", name: "Reputation Manager", shortName: "Reputation", description: "Monitor and respond to reviews across every platform, on-brand.", icon: Star, status: "live", accent: "amber", group: "Protect & Analyze" },
  { slug: "brand-guardian", name: "Brand Guardian", shortName: "Brand", description: "Keep every asset and message on-brand with automated compliance checks.", icon: ShieldCheck, status: "live", accent: "primary", group: "Protect & Analyze" },
  { slug: "competitor-intel", name: "Competitor Intelligence", shortName: "Competitors", description: "Track competitor moves across SEO, ads, social, and pricing.", icon: Radar, status: "live", accent: "primary", group: "Protect & Analyze" },
  { slug: "analytics", name: "Analytics AI", shortName: "Analytics", description: "Unified reporting and AI-generated insights across every channel.", icon: BarChart3, status: "live", accent: "growth", group: "Protect & Analyze" },
]

export const MODULE_GROUPS = ["Command", "Create", "Distribute", "Grow", "Protect & Analyze"] as const

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug)
}
