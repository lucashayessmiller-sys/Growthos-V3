import type { ContentPiece, Organization, WorkspaceUser } from "@/lib/types"

export const DEMO_ORG: Organization = {
  id: "org_demo",
  name: "Northbound Outfitters",
  slug: "northbound",
  plan: "Growth",
  logoInitials: "NO",
  industry: "Outdoor & Lifestyle Retail",
}

export const DEMO_USERS: WorkspaceUser[] = [
  { id: "u1", name: "Jordan Reyes", email: "jordan@northbound.co", role: "Owner", avatarInitials: "JR" },
  { id: "u2", name: "Priya Shah", email: "priya@northbound.co", role: "Admin", avatarInitials: "PS" },
  { id: "u3", name: "Marcus Lee", email: "marcus@northbound.co", role: "Editor", avatarInitials: "ML" },
  { id: "u4", name: "Aisha Bello", email: "aisha@northbound.co", role: "Contributor", avatarInitials: "AB" },
]

export const CURRENT_USER = DEMO_USERS[0]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export function seedContentPieces(): ContentPiece[] {
  const seeds: Array<Omit<ContentPiece, "id" | "versions" | "activeVersionId" | "createdAt" | "updatedAt">> = [
    {
      title: "Why Trail-Ready Gear Beats Trend-Ready Gear",
      type: "blog",
      status: "published",
      brief: { topic: "Why Trail-Ready Gear Beats Trend-Ready Gear", type: "blog", tone: "authoritative", audience: "outdoor enthusiasts aged 25-45", keywords: ["durable hiking gear", "trail-tested equipment"], length: "long", cta: "Shop trail-tested gear" },
      seoScore: 88, readabilityScore: 74, campaign: "Fall Trail Season", owner: "Marcus Lee", tags: ["SEO", "evergreen"],
    },
    {
      title: "5 Layering Mistakes Costing You Warmth",
      type: "blog",
      status: "in_review",
      brief: { topic: "5 Layering Mistakes Costing You Warmth", type: "blog", tone: "friendly", audience: "beginner hikers", keywords: ["layering system", "cold weather hiking"], length: "medium", cta: "Explore our layering guide" },
      seoScore: 76, readabilityScore: 81, campaign: "Fall Trail Season", owner: "Aisha Bello", tags: ["how-to"],
    },
    {
      title: "New Arrivals: The Ridgeline Collection",
      type: "email",
      status: "scheduled",
      brief: { topic: "New Arrivals: The Ridgeline Collection", type: "email", tone: "bold", audience: "existing customers", keywords: ["Ridgeline collection", "new arrivals"], length: "short", cta: "Shop the collection" },
      seoScore: 0, readabilityScore: 90, campaign: "Ridgeline Launch", owner: "Priya Shah", scheduledFor: daysFromNow(3), tags: ["launch", "newsletter"],
    },
    {
      title: "Ridgeline Jacket — Carousel Ad",
      type: "ad",
      status: "approved",
      brief: { topic: "Ridgeline Jacket — built for the shoulder season", type: "ad", tone: "bold", audience: "lookalike audience, 24-40", keywords: ["shoulder season jacket"], length: "short", cta: "Shop Now" },
      seoScore: 0, readabilityScore: 92, campaign: "Ridgeline Launch", owner: "Priya Shah", tags: ["paid social"],
    },
    {
      title: "Weekend Trail Report",
      type: "social",
      status: "draft",
      brief: { topic: "Weekend Trail Report", type: "social", tone: "playful", audience: "IG followers", keywords: ["trail conditions", "weekend hike"], length: "short", cta: "Tag us in your trail photos" },
      seoScore: 0, readabilityScore: 88, campaign: "Always-On Social", owner: "Aisha Bello", tags: ["UGC", "community"],
    },
    {
      title: "How Basecamp Outfitters Cut Return Rate 31%",
      type: "case-study",
      status: "draft",
      brief: { topic: "How Basecamp Outfitters Cut Return Rate 31%", type: "case-study", tone: "professional", audience: "B2B wholesale buyers", keywords: ["sizing accuracy", "return rate reduction"], length: "medium", cta: "Talk to our wholesale team" },
      seoScore: 62, readabilityScore: 70, campaign: "Wholesale Growth", owner: "Jordan Reyes", tags: ["B2B"],
    },
    {
      title: "Landing Page — Winter Boot Fit Finder",
      type: "landing",
      status: "in_review",
      brief: { topic: "Winter Boot Fit Finder", type: "landing", tone: "friendly", audience: "site visitors researching boots", keywords: ["boot fit finder", "winter boots"], length: "medium", cta: "Find my fit" },
      seoScore: 81, readabilityScore: 85, campaign: "Winter Conversion Push", owner: "Marcus Lee", tags: ["CRO"],
    },
    {
      title: "Monthly Trailhead Dispatch — November",
      type: "newsletter",
      status: "draft",
      brief: { topic: "Monthly Trailhead Dispatch — November", type: "newsletter", tone: "friendly", audience: "email subscribers", keywords: ["trail reports", "gear tips"], length: "medium", cta: "Read the full dispatch" },
      seoScore: 0, readabilityScore: 79, campaign: "Always-On Email", owner: "Jordan Reyes", tags: ["newsletter"],
    },
  ]

  return seeds.map((s, i) => {
    const id = `cp_${i + 1}`
    const v1 = {
      id: `${id}_v1`,
      createdAt: daysAgo(12 - i),
      body: placeholderBody(s.title, s.type),
      wordCount: 220 + i * 35,
      note: "Initial AI draft",
      generatedBy: "ai" as const,
    }
    return {
      ...s,
      id,
      versions: [v1],
      activeVersionId: v1.id,
      createdAt: daysAgo(12 - i),
      updatedAt: daysAgo(Math.max(0, 10 - i)),
    }
  })
}

function placeholderBody(title: string, type: string) {
  return `# ${title}\n\nThis ${type.replace("-", " ")} draft was generated by GrowthOS AI based on the campaign brief. Open the editor to review, regenerate, or approve for publishing.`
}

export const CAMPAIGNS = ["Fall Trail Season", "Ridgeline Launch", "Always-On Social", "Wholesale Growth", "Winter Conversion Push", "Always-On Email"]

// ---- Social Media Manager demo data ----
import type { Platform } from "@/lib/platforms"
import type { SocialPost, SocialTone, MediaType } from "@/lib/types"

export function seedSocialPosts(): SocialPost[] {
  const seeds: Array<{
    title: string; platform: Platform; mediaType: MediaType; status: SocialPost["status"]
    tone: SocialTone; audience: string; cta: string; hashtagCount: number
    caption: string; hashtags: string[]; campaign: string; owner: string
    daysOffset: number; published?: boolean
  }> = [
    { title: "Weekend Trail Report", platform: "instagram", mediaType: "carousel", status: "published", tone: "playful", audience: "IG followers", cta: "Tag us in your trail photos", hashtagCount: 6,
      caption: "Plot twist: the best trail of the season might be the one 10 minutes from home. Conditions were perfect this weekend — cool mornings, golden light, zero mud. Who else got out there?", hashtags: ["trailready", "weekendvibes", "outdoors", "community", "newarrival", "shopnow"],
      campaign: "Always-On Social", owner: "Aisha Bello", daysOffset: -6, published: true },
    { title: "Ridgeline Jacket Teaser", platform: "instagram", mediaType: "video", status: "published", tone: "bold", audience: "lookalike audience, 24-40", cta: "Link in bio to shop", hashtagCount: 5,
      caption: "Forget the old way of thinking about shoulder-season layers. The Ridgeline Jacket is built for the exact moment summer isn't sure it's over yet.", hashtags: ["ridgeline", "newarrival", "trailready", "craftsmanship", "shopnow"],
      campaign: "Ridgeline Launch", owner: "Priya Shah", daysOffset: -4, published: true },
    { title: "Wholesale Partner Spotlight", platform: "linkedin", mediaType: "image", status: "approved", tone: "professional", audience: "B2B wholesale buyers", cta: "Reach out to our partnerships team", hashtagCount: 3,
      caption: "A quick update on our growing network of independent outfitters. Basecamp Outfitters cut return rates by 31% after switching to our sizing-accurate line — here's how.", hashtags: ["sustainability", "craftsmanship", "growth"],
      campaign: "Wholesale Growth", owner: "Jordan Reyes", daysOffset: 2 },
    { title: "New Arrivals Announcement", platform: "facebook", mediaType: "image", status: "scheduled", tone: "friendly", audience: "existing customers", cta: "Shop the collection", hashtagCount: 2,
      caption: "Let's talk about what just landed in the shop. The Ridgeline Collection is here, and it's built for exactly the kind of weekend you've got planned.", hashtags: ["newarrival", "shopnow"],
      campaign: "Ridgeline Launch", owner: "Priya Shah", daysOffset: 3 },
    { title: "Quick Gear Tip", platform: "x", mediaType: "text", status: "draft", tone: "playful", audience: "X followers", cta: "", hashtagCount: 1,
      caption: "Okay, real talk about wool socks: two thin pairs beat one thick pair every time. Your feet will thank you.", hashtags: ["trailready"],
      campaign: "Always-On Social", owner: "Marcus Lee", daysOffset: 1 },
    { title: "TikTok — Boot Break-In Hack", platform: "tiktok", mediaType: "video", status: "in_review", tone: "playful", audience: "Gen Z outdoor curious", cta: "Follow for more gear hacks", hashtagCount: 4,
      caption: "So here's a fun one — the 3-day boot break-in method nobody tells you about. Trust us, your future blister-free self will send flowers.", hashtags: ["gearhack", "trailready", "outdoors", "community"],
      campaign: "Always-On Social", owner: "Aisha Bello", daysOffset: 5 },
    { title: "Customer Story Repost", platform: "instagram", mediaType: "image", status: "draft", tone: "empathetic", audience: "IG followers", cta: "Share your story with us", hashtagCount: 4,
      caption: "We know how it feels to finally find gear that just works. This one's from Sam, who wore the Ridgeline on a 40km ridge traverse last month.", hashtags: ["customerlove", "community", "trailready", "behindthescenes"],
      campaign: "Always-On Social", owner: "Aisha Bello", daysOffset: 7 },
    { title: "LinkedIn — Q3 Sustainability Update", platform: "linkedin", mediaType: "text", status: "draft", tone: "authoritative", audience: "B2B + press", cta: "Read the full report", hashtagCount: 3,
      caption: "The data is clear on recycled materials: our Q3 supply chain shift cut waste by 18% without touching durability. Here's what changed.", hashtags: ["sustainability", "growth", "craftsmanship"],
      campaign: "Wholesale Growth", owner: "Jordan Reyes", daysOffset: 9 },
  ]

  return seeds.map((s, i) => {
    const id = `sp_${i + 1}`
    const versionId = `${id}_v1`
    const createdAt = daysAgo(14 - i)
    const scheduledFor = s.status === "scheduled" ? daysFromNow(s.daysOffset) : undefined
    const publishedAt = s.published ? daysAgo(Math.abs(s.daysOffset)) : undefined
    return {
      id,
      title: s.title,
      platform: s.platform,
      mediaType: s.mediaType,
      status: s.status,
      brief: { topic: s.title, platform: s.platform, tone: s.tone, mediaType: s.mediaType, audience: s.audience, hashtagCount: s.hashtagCount, cta: s.cta },
      activeVersionId: versionId,
      versions: [{ id: versionId, createdAt, caption: s.caption, hashtags: s.hashtags, note: "Initial AI draft", generatedBy: "ai" as const }],
      campaign: s.campaign,
      owner: s.owner,
      createdAt,
      updatedAt: createdAt,
      scheduledFor,
      publishedAt,
      engagement: s.published
        ? { likes: Math.floor(180 + i * 47), comments: Math.floor(12 + i * 3), shares: Math.floor(6 + i * 2), reach: Math.floor(3200 + i * 620), saves: Math.floor(20 + i * 5) }
        : undefined,
      tags: [],
    }
  })
}

// ---- CRM + Lead Engine demo data ----
import type { Contact, Deal, DealStage } from "@/lib/types"

export function seedContacts(): Contact[] {
  const seeds: Array<Pick<Contact, "name" | "email" | "phone" | "company" | "status" | "source" | "tags" | "notes"> & { daysAgo: number }> = [
    { name: "Sam Whitfield", email: "sam@basecampoutfitters.com", phone: "705-555-0142", company: "Basecamp Outfitters", status: "customer", source: "Referral", tags: ["wholesale"], notes: "Long-time wholesale partner, reorders quarterly.", daysAgo: 3 },
    { name: "Dana Okafor", email: "dana.okafor@gmail.com", phone: "", company: "", status: "lead", source: "Instagram ad", tags: ["retail"], notes: "Clicked the Ridgeline launch ad, hasn't purchased yet.", daysAgo: 1 },
    { name: "Marcus Webb", email: "marcus@trailheadandco.com", phone: "416-555-0110", company: "Trailhead & Co.", status: "qualified", source: "Trade show", tags: ["wholesale", "high-value"], notes: "Interested in a 200-unit boot order for spring.", daysAgo: 5 },
    { name: "Riley Chen", email: "riley.chen@outlook.com", phone: "647-555-0199", company: "", status: "lead", source: "Website form", tags: ["retail"], notes: "Asked about winter boot sizing via contact form.", daysAgo: 2 },
    { name: "Priya Anand", email: "priya@summitgearexchange.com", phone: "705-555-0177", company: "Summit Gear Exchange", status: "customer", source: "Cold outreach", tags: ["wholesale"], notes: "Trade-in partnership, monthly consignment drops.", daysAgo: 14 },
    { name: "Tom Bergeron", email: "tbergeron@yahoo.com", phone: "", company: "", status: "churned", source: "Email campaign", tags: [], notes: "Purchased once last year, unsubscribed from emails.", daysAgo: 90 },
    { name: "Elena Vasquez", email: "elena@ridgelinesupply.com", phone: "519-555-0133", company: "Ridgeline Supply Co.", status: "qualified", source: "LinkedIn", tags: ["wholesale", "competitor-adjacent"], notes: "Explored a co-marketing partnership, needs follow-up.", daysAgo: 8 },
    { name: "Jake Morrison", email: "jake.morrison@gmail.com", phone: "705-555-0188", company: "", status: "lead", source: "Instagram ad", tags: ["retail"], notes: "Commented on trail running post asking about shoe sizing.", daysAgo: 0 },
  ]

  return seeds.map((s, i) => {
    const createdAt = daysAgo(s.daysAgo + 3)
    const updatedAt = daysAgo(s.daysAgo)
    return { id: `contact_${i + 1}`, ...s, owner: DEMO_USERS[i % DEMO_USERS.length].name, createdAt, updatedAt }
  })
}

export function seedDeals(contacts: Contact[]): Deal[] {
  const byCompany = (name: string) => contacts.find((c) => c.company.includes(name) || c.name === name)

  const seeds: Array<{ contact: Contact | undefined; title: string; value: number; stage: DealStage; probability: number; closeDaysOut: number; notes: string; daysAgo: number }> = [
    { contact: byCompany("Basecamp Outfitters"), title: "Basecamp Q1 Reorder", value: 8400, stage: "won", probability: 100, closeDaysOut: -10, notes: "Standard quarterly reorder, net-30 terms.", daysAgo: 20 },
    { contact: byCompany("Trailhead & Co."), title: "Trailhead Spring Boot Order", value: 14200, stage: "proposal", probability: 60, closeDaysOut: 18, notes: "Sent formal proposal for 200-unit boot order.", daysAgo: 6 },
    { contact: byCompany("Summit Gear Exchange"), title: "Summit Consignment Renewal", value: 3600, stage: "negotiation", probability: 75, closeDaysOut: 9, notes: "Renewing monthly consignment terms, minor pricing discussion.", daysAgo: 3 },
    { contact: byCompany("Ridgeline Supply Co."), title: "Ridgeline Co-Marketing Deal", value: 5000, stage: "qualified", probability: 35, closeDaysOut: 30, notes: "Exploring joint campaign for shoulder-season gear.", daysAgo: 8 },
    { contact: byCompany("Dana Okafor"), title: "Dana — Ridgeline Jacket Interest", value: 320, stage: "new", probability: 15, closeDaysOut: 14, notes: "Engaged with launch ad, no purchase yet.", daysAgo: 1 },
    { contact: byCompany("Riley Chen"), title: "Riley — Winter Boot Inquiry", value: 240, stage: "new", probability: 20, closeDaysOut: 10, notes: "Sizing question via contact form.", daysAgo: 2 },
    { contact: byCompany("Jake Morrison"), title: "Jake — Trail Shoe Inquiry", value: 180, stage: "new", probability: 15, closeDaysOut: 12, notes: "Asked about sizing in Instagram comments.", daysAgo: 0 },
    { contact: byCompany("Tom Bergeron"), title: "Tom — Reactivation Attempt", value: 150, stage: "lost", probability: 0, closeDaysOut: -30, notes: "No response to reactivation email series.", daysAgo: 45 },
  ]

  return seeds.map((s, i) => {
    const closeDate = new Date()
    closeDate.setDate(closeDate.getDate() + s.closeDaysOut)
    const createdAt = daysAgo(s.daysAgo + 2)
    return {
      id: `deal_${i + 1}`,
      contactId: s.contact?.id ?? null,
      title: s.title,
      value: s.value,
      stage: s.stage,
      probability: s.probability,
      expectedCloseDate: closeDate.toISOString().slice(0, 10),
      notes: s.notes,
      owner: DEMO_USERS[i % DEMO_USERS.length].name,
      createdAt,
      updatedAt: daysAgo(s.daysAgo),
    }
  })
}

// ---- Local Marketing Suite demo data ----
import type { Location } from "@/lib/types"

export function seedLocations(): Location[] {
  const seeds: Array<Omit<Location, "id" | "createdAt" | "updatedAt">> = [
    {
      name: "Collingwood store", address: "142 Hurontario St", city: "Collingwood", region: "Ontario", postalCode: "L9Y 2L6",
      phone: "705-555-0142", hours: "Mon–Sat 9am–6pm, Sun 10am–5pm", status: "active",
      description: "Our flagship storefront in downtown Collingwood, walking distance to the harbour trail.",
    },
    {
      name: "Blue Mountain outlet", address: "108 Jozo Weider Blvd", city: "The Blue Mountains", region: "Ontario", postalCode: "L9Y 0V2",
      phone: "705-555-0198", hours: "Daily 9am–7pm (seasonal)", status: "active",
      description: "Slopeside outlet with rental gear and last-season deals, open through ski and hiking seasons.",
    },
    {
      name: "Online order", address: "", city: "", region: "Ontario", postalCode: "", phone: "1-855-555-0100",
      hours: "24/7", status: "active", description: "Northbound Outfitters' e-commerce fulfillment — ships across Canada.",
    },
  ]

  return seeds.map((s, i) => ({ ...s, id: `loc_${i + 1}`, createdAt: daysAgo(120 - i * 10), updatedAt: daysAgo(5 - i) }))
}

// ---- Paid Ads Manager demo data ----
import type { AdCampaign } from "@/lib/types"

export function seedAdCampaigns(): AdCampaign[] {
  const seeds: Array<Omit<AdCampaign, "id" | "owner" | "createdAt" | "updatedAt">> = [
    {
      name: "Ridgeline Launch — Meta Traffic", platform: "meta", objective: "traffic", status: "active", budgetDaily: 45,
      startDate: new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10), endDate: null,
      targetAudience: "Lookalike audience, 24-40, outdoor & lifestyle interests", headline: "Built for the shoulder season",
      body: "The Ridgeline Jacket handles the exact moment summer isn't sure it's over yet. Shop the collection.",
      cta: "Shop Now", notes: "Primary launch campaign for the Ridgeline collection.",
    },
    {
      name: "Winter Boot Fit Finder — Google Search", platform: "google", objective: "conversions", status: "active", budgetDaily: 30,
      startDate: new Date(Date.now() - 8 * 86_400_000).toISOString().slice(0, 10), endDate: null,
      targetAudience: "Search intent: winter boots, hiking boots sizing", headline: "Find Your Perfect Winter Boot Fit",
      body: "Answer 4 quick questions and we'll match you to the right size and style.", cta: "Find My Fit",
      notes: "Driving traffic to the Boot Fit Finder landing page.",
    },
    {
      name: "Trail Running Awareness — TikTok", platform: "tiktok", objective: "awareness", status: "draft", budgetDaily: 20,
      startDate: null, endDate: null, targetAudience: "Gen Z, outdoor curious, 18-28", headline: "The 3-day boot break-in hack",
      body: "Nobody tells you this trick — your future blister-free self will thank you.", cta: "Learn More",
      notes: "Concept campaign, awaiting creative review before launch.",
    },
  ]

  return seeds.map((s, i) => ({ ...s, id: `ad_${i + 1}`, owner: DEMO_USERS[i % DEMO_USERS.length].name, createdAt: daysAgo(20 - i * 3), updatedAt: daysAgo(i) }))
}
