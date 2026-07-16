"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { ContentBrief, ContentPiece, ContentStatus, ContentVersion } from "@/lib/types"
import { seedContentPieces } from "@/lib/demo-data"
import { scoreSeo, scoreReadability } from "@/engines/seo"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import {
  createContentPieceAction, addContentVersionAction, setActiveContentVersionAction,
  updateContentStatusAction, updateContentBriefAction, editContentVersionBodyAction, removeContentPieceAction,
} from "@/app/actions/content-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

// Persistence strategy: when Supabase isn't configured, this store (+
// localStorage via `persist`) IS the database — fully local, zero cost.
// When Supabase IS configured, Supabase is the source of truth: the store
// applies changes optimistically for instant UI feedback, then fires the
// matching Server Action in the background. `hydrate()` always re-syncs
// from the server-fetched props in that mode, so a stale local cache can
// never permanently shadow real data — see the isSupabaseConfigured branch
// below. Only `createFromBrief` awaits its Server Action before returning,
// since the caller immediately navigates using the returned id and that
// has to be the real database id, not a throwaway local one.

interface ContentStore {
  pieces: ContentPiece[]
  hydrated: boolean
  hydrate: (initialItems?: ContentPiece[]) => void
  createFromBrief: (brief: ContentBrief, body: string) => Promise<ContentPiece>
  addVersion: (pieceId: string, body: string, note: string, generatedBy?: "ai" | "human") => void
  setActiveVersion: (pieceId: string, versionId: string) => void
  updateStatus: (pieceId: string, status: ContentStatus) => void
  updateBrief: (pieceId: string, brief: ContentBrief) => void
  editActiveVersionBody: (pieceId: string, body: string) => void
  removePiece: (pieceId: string) => void
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      pieces: [],
      hydrated: false,
      hydrate: (initialItems) => {
        if (isSupabaseConfigured()) {
          set({ pieces: initialItems ?? get().pieces, hydrated: true })
        } else if (get().pieces.length === 0) {
          set({ pieces: initialItems ?? seedContentPieces(), hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createFromBrief: async (brief, body) => {
        const seo = scoreSeo(body, brief.topic, brief.keywords)
        const readability = scoreReadability(body)
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createContentPieceAction(brief, body, seo.score, readability.score)
          if (result.success) {
            const piece: ContentPiece = {
              id: result.data.id,
              title: brief.topic,
              type: brief.type,
              status: "draft",
              brief,
              activeVersionId: result.data.versionId,
              versions: [{ id: result.data.versionId, createdAt: now, body, wordCount: body.split(/\s+/).length, note: "Initial AI draft", generatedBy: "ai" }],
              seoScore: seo.score,
              readabilityScore: readability.score,
              campaign: "Unassigned",
              owner: "You",
              createdAt: now,
              updatedAt: now,
              tags: [],
            }
            set({ pieces: [piece, ...get().pieces] })
            return piece
          }
          toast.error("Couldn't save to your workspace — please try again")
          throw new Error(result.error)
        }

        const piece: ContentPiece = {
          id: uid("cp"),
          title: brief.topic,
          type: brief.type,
          status: "draft",
          brief,
          activeVersionId: uid("v"),
          versions: [],
          seoScore: seo.score,
          readabilityScore: readability.score,
          campaign: "Unassigned",
          owner: "You",
          createdAt: now,
          updatedAt: now,
          tags: [],
        }
        piece.versions = [{ id: piece.activeVersionId, createdAt: now, body, wordCount: body.split(/\s+/).length, note: "Initial AI draft", generatedBy: "ai" }]
        set({ pieces: [piece, ...get().pieces] })
        return piece
      },
      addVersion: (pieceId, body, note, generatedBy = "ai") => {
        const seo = scoreSeo(body, get().pieces.find((p) => p.id === pieceId)?.brief.topic ?? "", get().pieces.find((p) => p.id === pieceId)?.brief.keywords ?? [])
        const readability = scoreReadability(body)
        const version: ContentVersion = { id: uid("v"), createdAt: new Date().toISOString(), body, wordCount: body.split(/\s+/).length, note, generatedBy }

        set({
          pieces: get().pieces.map((p) =>
            p.id === pieceId
              ? { ...p, versions: [...p.versions, version], activeVersionId: version.id, updatedAt: version.createdAt, seoScore: seo.score, readabilityScore: readability.score }
              : p
          ),
        })

        if (isSupabaseConfigured()) {
          addContentVersionAction(pieceId, body, note, generatedBy, seo.score, readability.score).then((r) => {
            if (!r.success) toast.error("Couldn't sync this version to your workspace")
          })
        }
      },
      setActiveVersion: (pieceId, versionId) => {
        set({ pieces: get().pieces.map((p) => (p.id === pieceId ? { ...p, activeVersionId: versionId } : p)) })
        if (isSupabaseConfigured()) {
          setActiveContentVersionAction(pieceId, versionId).then((r) => {
            if (!r.success) toast.error("Couldn't sync this change to your workspace")
          })
        }
      },
      updateStatus: (pieceId, status) => {
        set({ pieces: get().pieces.map((p) => (p.id === pieceId ? { ...p, status, updatedAt: new Date().toISOString() } : p)) })
        if (isSupabaseConfigured()) {
          updateContentStatusAction(pieceId, status).then((r) => {
            if (!r.success) toast.error("Couldn't sync this status change to your workspace")
          })
        }
      },
      updateBrief: (pieceId, brief) => {
        set({ pieces: get().pieces.map((p) => (p.id === pieceId ? { ...p, brief, title: brief.topic } : p)) })
        if (isSupabaseConfigured()) {
          updateContentBriefAction(pieceId, brief).then((r) => {
            if (!r.success) toast.error("Couldn't sync this brief to your workspace")
          })
        }
      },
      editActiveVersionBody: (pieceId, body) => {
        const piece = get().pieces.find((p) => p.id === pieceId)
        const seo = scoreSeo(body, piece?.brief.topic ?? "", piece?.brief.keywords ?? [])
        const readability = scoreReadability(body)

        set({
          pieces: get().pieces.map((p) => {
            if (p.id !== pieceId) return p
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              seoScore: seo.score,
              readabilityScore: readability.score,
              versions: p.versions.map((v) => (v.id === p.activeVersionId ? { ...v, body, wordCount: body.split(/\s+/).length, generatedBy: "human" as const } : v)),
            }
          }),
        })

        if (isSupabaseConfigured() && piece) {
          editContentVersionBodyAction(piece.activeVersionId, pieceId, body, seo.score, readability.score).then((r) => {
            if (!r.success) toast.error("Couldn't sync this edit to your workspace")
          })
        }
      },
      removePiece: (pieceId) => {
        set({ pieces: get().pieces.filter((p) => p.id !== pieceId) })
        if (isSupabaseConfigured()) {
          removeContentPieceAction(pieceId).then((r) => {
            if (!r.success) toast.error("Couldn't delete this from your workspace")
          })
        }
      },
    }),
    { name: "growthos-content-store" }
  )
)
