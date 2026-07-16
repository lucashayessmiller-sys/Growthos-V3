"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { AdCampaign, AdCampaignStatus } from "@/lib/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createCampaignAction, updateCampaignAction, updateCampaignStatusAction, deleteCampaignAction } from "@/app/actions/ads-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

interface AdsStore {
  campaigns: AdCampaign[]
  hydrated: boolean
  hydrate: (initial?: AdCampaign[]) => void
  createCampaign: (input: Omit<AdCampaign, "id" | "owner" | "createdAt" | "updatedAt">) => Promise<AdCampaign>
  updateCampaign: (id: string, patch: Partial<AdCampaign>) => void
  updateCampaignStatus: (id: string, status: AdCampaignStatus) => void
  deleteCampaign: (id: string) => void
}

export const useAdsStore = create<AdsStore>()(
  persist(
    (set, get) => ({
      campaigns: [],
      hydrated: false,
      hydrate: (initial) => {
        if (isSupabaseConfigured()) {
          set({ campaigns: initial ?? get().campaigns, hydrated: true })
        } else if (get().campaigns.length === 0) {
          set({ campaigns: initial ?? [], hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createCampaign: async (input) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createCampaignAction(input)
          if (result.success) {
            const campaign: AdCampaign = { ...input, id: result.data.id, owner: "You", createdAt: now, updatedAt: now }
            set({ campaigns: [campaign, ...get().campaigns] })
            return campaign
          }
          toast.error("Couldn't save this campaign — please try again")
          throw new Error(result.error)
        }

        const campaign: AdCampaign = { ...input, id: uid("ad"), owner: "You", createdAt: now, updatedAt: now }
        set({ campaigns: [campaign, ...get().campaigns] })
        return campaign
      },
      updateCampaign: (id, patch) => {
        set({ campaigns: get().campaigns.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)) })
        if (isSupabaseConfigured()) {
          updateCampaignAction(id, patch).then((r) => { if (!r.success) toast.error("Couldn't sync this campaign") })
        }
      },
      updateCampaignStatus: (id, status) => {
        set({ campaigns: get().campaigns.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)) })
        if (isSupabaseConfigured()) {
          updateCampaignStatusAction(id, status).then((r) => { if (!r.success) toast.error("Couldn't sync this status change") })
        }
      },
      deleteCampaign: (id) => {
        set({ campaigns: get().campaigns.filter((c) => c.id !== id) })
        if (isSupabaseConfigured()) {
          deleteCampaignAction(id).then((r) => { if (!r.success) toast.error("Couldn't delete this campaign") })
        }
      },
    }),
    { name: "growthos-ads-store" }
  )
)
