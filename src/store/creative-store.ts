"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { CreativeDesign, DesignLayer } from "@/lib/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createDesignAction, updateDesignAction, deleteDesignAction } from "@/app/actions/creative-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

interface CreativeStore {
  designs: CreativeDesign[]
  hydrated: boolean
  hydrate: (initial?: CreativeDesign[]) => void
  createDesign: (input: { name: string; canvasWidth: number; canvasHeight: number; layers: DesignLayer[]; thumbnailDataUrl: string | null }) => Promise<CreativeDesign>
  updateDesign: (id: string, patch: Partial<Pick<CreativeDesign, "name" | "layers" | "thumbnailDataUrl">>) => void
  deleteDesign: (id: string) => void
}

export const useCreativeStore = create<CreativeStore>()(
  persist(
    (set, get) => ({
      designs: [],
      hydrated: false,
      hydrate: (initial) => {
        if (isSupabaseConfigured()) {
          set({ designs: initial ?? get().designs, hydrated: true })
        } else if (get().designs.length === 0) {
          set({ designs: initial ?? [], hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createDesign: async (input) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createDesignAction(input)
          if (result.success) {
            const design: CreativeDesign = { ...input, id: result.data.id, owner: "You", createdAt: now, updatedAt: now }
            set({ designs: [design, ...get().designs] })
            return design
          }
          toast.error("Couldn't save this design — please try again")
          throw new Error(result.error)
        }

        const design: CreativeDesign = { ...input, id: uid("design"), owner: "You", createdAt: now, updatedAt: now }
        set({ designs: [design, ...get().designs] })
        return design
      },
      updateDesign: (id, patch) => {
        set({ designs: get().designs.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)) })
        if (isSupabaseConfigured()) {
          updateDesignAction(id, patch).then((r) => { if (!r.success) toast.error("Couldn't sync this design") })
        }
      },
      deleteDesign: (id) => {
        set({ designs: get().designs.filter((d) => d.id !== id) })
        if (isSupabaseConfigured()) {
          deleteDesignAction(id).then((r) => { if (!r.success) toast.error("Couldn't delete this design") })
        }
      },
    }),
    { name: "growthos-creative-store" }
  )
)
