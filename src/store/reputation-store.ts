"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { Review } from "@/lib/types"
import type { ReviewWithResponse, ReviewResponseVersion } from "@/lib/data/reputation"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createReviewResponseAction, addReviewResponseVersionAction, publishReviewResponseAction } from "@/app/actions/reputation-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export interface ResponseState {
  id: string // content_items id in Supabase mode, local id in demo mode
  status: "draft" | "published"
  activeVersionId: string
  versions: ReviewResponseVersion[]
}

interface ReputationStore {
  responses: Record<string, ResponseState> // keyed by reviewId
  hydrated: boolean
  hydrate: (reviews?: ReviewWithResponse[]) => void
  createResponse: (review: Review, body: string) => Promise<void>
  addVersion: (reviewId: string, body: string, note: string, generatedBy?: "ai" | "human") => void
  editVersionBody: (reviewId: string, body: string) => void
  publishResponse: (reviewId: string) => void
}

export const useReputationStore = create<ReputationStore>()(
  persist(
    (set, get) => ({
      responses: {},
      hydrated: false,
      hydrate: (reviews) => {
        if (!reviews) {
          set({ hydrated: true })
          return
        }
        if (isSupabaseConfigured()) {
          const next: Record<string, ResponseState> = {}
          for (const r of reviews) {
            if (r.responseStatus !== "none" && r.activeVersionId) {
              next[r.id] = { id: r.id, status: r.responseStatus === "published" ? "published" : "draft", activeVersionId: r.activeVersionId, versions: r.versions }
            }
          }
          set({ responses: next, hydrated: true })
        } else if (Object.keys(get().responses).length === 0) {
          const next: Record<string, ResponseState> = {}
          for (const r of reviews) {
            if (r.responseStatus !== "none" && r.activeVersionId) {
              next[r.id] = { id: r.id, status: r.responseStatus === "published" ? "published" : "draft", activeVersionId: r.activeVersionId, versions: r.versions }
            }
          }
          set({ responses: next, hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createResponse: async (review, body) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createReviewResponseAction(review, body)
          if (result.success) {
            set({
              responses: {
                ...get().responses,
                [review.id]: {
                  id: result.data.id,
                  status: "draft",
                  activeVersionId: result.data.versionId,
                  versions: [{ id: result.data.versionId, createdAt: now, body, note: "Initial AI draft", generatedBy: "ai" }],
                },
              },
            })
            return
          }
          toast.error("Couldn't save this response to your workspace")
          return
        }

        const versionId = uid("v")
        set({
          responses: {
            ...get().responses,
            [review.id]: { id: uid("resp"), status: "draft", activeVersionId: versionId, versions: [{ id: versionId, createdAt: now, body, note: "Initial AI draft", generatedBy: "ai" }] },
          },
        })
      },
      addVersion: (reviewId, body, note, generatedBy = "ai") => {
        const existing = get().responses[reviewId]
        if (!existing) return
        const version: ReviewResponseVersion = { id: uid("v"), createdAt: new Date().toISOString(), body, note, generatedBy }
        set({ responses: { ...get().responses, [reviewId]: { ...existing, versions: [...existing.versions, version], activeVersionId: version.id } } })

        if (isSupabaseConfigured()) {
          addReviewResponseVersionAction(existing.id, body, note, generatedBy).then((r) => {
            if (!r.success) toast.error("Couldn't sync this version to your workspace")
          })
        }
      },
      editVersionBody: (reviewId, body) => {
        const existing = get().responses[reviewId]
        if (!existing) return
        set({
          responses: {
            ...get().responses,
            [reviewId]: { ...existing, versions: existing.versions.map((v) => (v.id === existing.activeVersionId ? { ...v, body, generatedBy: "human" as const } : v)) },
          },
        })
        // Manual edits are kept local-only for now (folded into the next
        // regenerate/publish sync) rather than adding a dedicated action
        // for this narrower module — the pattern is identical to Content
        // Factory's editActiveVersionBody if this needs to be split out.
      },
      publishResponse: (reviewId) => {
        const existing = get().responses[reviewId]
        if (!existing) return
        set({ responses: { ...get().responses, [reviewId]: { ...existing, status: "published" } } })

        if (isSupabaseConfigured()) {
          publishReviewResponseAction(existing.id).then((r) => {
            if (!r.success) toast.error("Couldn't sync the publish status to your workspace")
          })
        }
      },
    }),
    { name: "growthos-reputation-store" }
  )
)
