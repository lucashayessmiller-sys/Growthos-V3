"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { CmoBrief } from "@/lib/data/cmo"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createCmoBriefAction, addCmoBriefVersionAction, updateCmoBriefStatusAction } from "@/app/actions/cmo-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

interface CmoStore {
  brief: CmoBrief | null
  hydrated: boolean
  hydrate: (initial: CmoBrief | null) => void
  createBrief: (body: string) => Promise<CmoBrief>
  addVersion: (body: string, note: string, generatedBy?: "ai" | "human") => void
  updateStatus: (status: "draft" | "approved") => void
}

export const useCmoStore = create<CmoStore>()(
  persist(
    (set, get) => ({
      brief: null,
      hydrated: false,
      hydrate: (initial) => {
        if (isSupabaseConfigured()) {
          set({ brief: initial, hydrated: true })
        } else if (!get().hydrated) {
          set({ brief: initial ?? get().brief, hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createBrief: async (body) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createCmoBriefAction(body)
          if (result.success) {
            const brief: CmoBrief = {
              id: result.data.id, activeVersionId: result.data.versionId,
              versions: [{ id: result.data.versionId, createdAt: now, body, note: "Initial AI-generated brief", generatedBy: "ai" }],
              status: "draft", createdAt: now, updatedAt: now,
            }
            set({ brief })
            return brief
          }
          toast.error("Couldn't save the brief — please try again")
          throw new Error(result.error)
        }

        const versionId = uid("v")
        const brief: CmoBrief = {
          id: uid("brief"), activeVersionId: versionId,
          versions: [{ id: versionId, createdAt: now, body, note: "Initial AI-generated brief", generatedBy: "ai" }],
          status: "draft", createdAt: now, updatedAt: now,
        }
        set({ brief })
        return brief
      },
      addVersion: (body, note, generatedBy = "ai") => {
        const current = get().brief
        if (!current) return
        const version = { id: uid("v"), createdAt: new Date().toISOString(), body, note, generatedBy }
        set({ brief: { ...current, versions: [...current.versions, version], activeVersionId: version.id, status: "draft", updatedAt: version.createdAt } })

        if (isSupabaseConfigured()) {
          addCmoBriefVersionAction(current.id, body, note, generatedBy).then((r) => {
            if (!r.success) toast.error("Couldn't sync this version to your workspace")
          })
        }
      },
      updateStatus: (status) => {
        const current = get().brief
        if (!current) return
        set({ brief: { ...current, status, updatedAt: new Date().toISOString() } })

        if (isSupabaseConfigured()) {
          updateCmoBriefStatusAction(current.id, status).then((r) => {
            if (!r.success) toast.error("Couldn't sync this status change")
          })
        }
      },
    }),
    { name: "growthos-cmo-store" }
  )
)
