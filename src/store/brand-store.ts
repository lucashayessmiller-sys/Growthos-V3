"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { BrandKit } from "@/lib/types"
import { DEFAULT_BRAND_KIT } from "@/engines/brand"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { updateBrandKitAction } from "@/app/actions/brand-actions"

interface BrandStore {
  brandKit: BrandKit
  hydrated: boolean
  hydrate: (initial?: BrandKit) => void
  updateBrandKit: (kit: BrandKit) => Promise<void>
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set) => ({
      brandKit: DEFAULT_BRAND_KIT,
      hydrated: false,
      hydrate: (initial) => {
        if (isSupabaseConfigured()) {
          set({ brandKit: initial ?? DEFAULT_BRAND_KIT, hydrated: true })
        } else {
          set((state) => (state.hydrated ? { hydrated: true } : { brandKit: initial ?? state.brandKit, hydrated: true }))
        }
      },
      updateBrandKit: async (kit) => {
        set({ brandKit: kit })
        if (isSupabaseConfigured()) {
          const result = await updateBrandKitAction(kit)
          if (!result.success) toast.error("Couldn't save your brand kit — please try again")
        }
      },
    }),
    { name: "growthos-brand-store" }
  )
)
