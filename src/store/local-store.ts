"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { Location } from "@/lib/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createLocationAction, updateLocationAction, deleteLocationAction } from "@/app/actions/local-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

interface LocalStore {
  locations: Location[]
  hydrated: boolean
  hydrate: (initial?: Location[]) => void
  createLocation: (input: Omit<Location, "id" | "createdAt" | "updatedAt">) => Promise<Location>
  updateLocation: (id: string, patch: Partial<Location>) => void
  deleteLocation: (id: string) => void
}

export const useLocalStore = create<LocalStore>()(
  persist(
    (set, get) => ({
      locations: [],
      hydrated: false,
      hydrate: (initial) => {
        if (isSupabaseConfigured()) {
          set({ locations: initial ?? get().locations, hydrated: true })
        } else if (get().locations.length === 0) {
          set({ locations: initial ?? [], hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createLocation: async (input) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createLocationAction(input)
          if (result.success) {
            const location: Location = { ...input, id: result.data.id, createdAt: now, updatedAt: now }
            set({ locations: [...get().locations, location] })
            return location
          }
          toast.error("Couldn't save this location — please try again")
          throw new Error(result.error)
        }

        const location: Location = { ...input, id: uid("loc"), createdAt: now, updatedAt: now }
        set({ locations: [...get().locations, location] })
        return location
      },
      updateLocation: (id, patch) => {
        set({ locations: get().locations.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l)) })
        if (isSupabaseConfigured()) {
          updateLocationAction(id, patch).then((r) => { if (!r.success) toast.error("Couldn't sync this location") })
        }
      },
      deleteLocation: (id) => {
        set({ locations: get().locations.filter((l) => l.id !== id) })
        if (isSupabaseConfigured()) {
          deleteLocationAction(id).then((r) => { if (!r.success) toast.error("Couldn't delete this location") })
        }
      },
    }),
    { name: "growthos-local-store" }
  )
)
