import "server-only"
import type { ContentPiece, ContentVersion, SocialPost, SocialVersion } from "@/lib/types"

// Shape of a content_items row joined with its content_versions, as
// returned by `.select("*, content_versions(*)")`. Kept loose (any-ish)
// since Supabase's generated types aren't wired up without a live project
// to introspect — tighten this with `supabase gen types` once connected.
export interface ContentItemRow {
  id: string
  title: string
  type: string
  status: string
  brief: Record<string, unknown>
  metadata: Record<string, unknown>
  active_version_id: string | null
  campaign: string | null
  owner_name: string | null
  scheduled_for: string | null
  published_at: string | null
  tags: string[]
  created_at: string
  updated_at: string
  content_versions: ContentVersionRow[]
}

export interface ContentVersionRow {
  id: string
  content_id: string
  body: string
  metadata: Record<string, unknown>
  note: string | null
  generated_by: "ai" | "human"
  created_at: string
}

export function mapRowToContentPiece(row: ContentItemRow): ContentPiece {
  const versions: ContentVersion[] = [...row.content_versions]
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    .map((v) => ({
      id: v.id,
      createdAt: v.created_at,
      body: v.body,
      wordCount: v.body.split(/\s+/).filter(Boolean).length,
      note: v.note ?? "",
      generatedBy: v.generated_by,
    }))

  return {
    id: row.id,
    title: row.title,
    type: row.type as ContentPiece["type"],
    status: row.status as ContentPiece["status"],
    brief: row.brief as unknown as ContentPiece["brief"],
    activeVersionId: row.active_version_id ?? versions[versions.length - 1]?.id ?? "",
    versions,
    seoScore: Number(row.metadata?.seoScore ?? 0),
    readabilityScore: Number(row.metadata?.readabilityScore ?? 0),
    campaign: row.campaign ?? "Unassigned",
    owner: row.owner_name ?? "Unknown",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledFor: row.scheduled_for ?? undefined,
    tags: row.tags ?? [],
  }
}

export function mapRowToSocialPost(row: ContentItemRow): SocialPost {
  const versions: SocialVersion[] = [...row.content_versions]
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    .map((v) => ({
      id: v.id,
      createdAt: v.created_at,
      caption: v.body,
      hashtags: (v.metadata?.hashtags as string[] | undefined) ?? [],
      note: v.note ?? "",
      generatedBy: v.generated_by,
    }))

  return {
    id: row.id,
    title: row.title,
    platform: (row.metadata?.platform as SocialPost["platform"]) ?? "instagram",
    mediaType: (row.metadata?.mediaType as SocialPost["mediaType"]) ?? "image",
    status: row.status as SocialPost["status"],
    brief: row.brief as unknown as SocialPost["brief"],
    activeVersionId: row.active_version_id ?? versions[versions.length - 1]?.id ?? "",
    versions,
    campaign: row.campaign ?? "Unassigned",
    owner: row.owner_name ?? "Unknown",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledFor: row.scheduled_for ?? undefined,
    publishedAt: row.published_at ?? undefined,
    engagement: row.metadata?.engagement as SocialPost["engagement"],
    tags: row.tags ?? [],
  }
}
