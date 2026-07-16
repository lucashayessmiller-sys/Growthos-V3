"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { Contact, ContactStatus, Deal, DealStage } from "@/lib/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import {
  createContactAction, updateContactAction, updateContactStatusAction, deleteContactAction,
  createDealAction, updateDealStageAction, updateDealAction, deleteDealAction,
} from "@/app/actions/crm-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

interface CrmStore {
  contacts: Contact[]
  deals: Deal[]
  hydrated: boolean
  hydrate: (contacts?: Contact[], deals?: Deal[]) => void
  createContact: (input: Omit<Contact, "id" | "owner" | "createdAt" | "updatedAt">) => Promise<Contact>
  updateContact: (id: string, patch: Partial<Contact>) => void
  updateContactStatus: (id: string, status: ContactStatus) => void
  deleteContact: (id: string) => void
  createDeal: (input: Omit<Deal, "id" | "owner" | "createdAt" | "updatedAt">) => Promise<Deal>
  updateDealStage: (id: string, stage: DealStage, probability: number) => void
  updateDeal: (id: string, patch: Partial<Deal>) => void
  deleteDeal: (id: string) => void
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set, get) => ({
      contacts: [],
      deals: [],
      hydrated: false,
      hydrate: (contacts, deals) => {
        if (isSupabaseConfigured()) {
          set({ contacts: contacts ?? get().contacts, deals: deals ?? get().deals, hydrated: true })
        } else if (get().contacts.length === 0 && get().deals.length === 0) {
          set({ contacts: contacts ?? [], deals: deals ?? [], hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createContact: async (input) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createContactAction(input)
          if (result.success) {
            const contact: Contact = { ...input, id: result.data.id, owner: "You", createdAt: now, updatedAt: now }
            set({ contacts: [contact, ...get().contacts] })
            return contact
          }
          toast.error("Couldn't save this contact — please try again")
          throw new Error(result.error)
        }

        const contact: Contact = { ...input, id: uid("contact"), owner: "You", createdAt: now, updatedAt: now }
        set({ contacts: [contact, ...get().contacts] })
        return contact
      },
      updateContact: (id, patch) => {
        set({ contacts: get().contacts.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c)) })
        if (isSupabaseConfigured()) {
          updateContactAction(id, patch).then((r) => { if (!r.success) toast.error("Couldn't sync this contact") })
        }
      },
      updateContactStatus: (id, status) => {
        set({ contacts: get().contacts.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)) })
        if (isSupabaseConfigured()) {
          updateContactStatusAction(id, status).then((r) => { if (!r.success) toast.error("Couldn't sync this status change") })
        }
      },
      deleteContact: (id) => {
        set({ contacts: get().contacts.filter((c) => c.id !== id) })
        if (isSupabaseConfigured()) {
          deleteContactAction(id).then((r) => { if (!r.success) toast.error("Couldn't delete this contact") })
        }
      },
      createDeal: async (input) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createDealAction(input)
          if (result.success) {
            const deal: Deal = { ...input, id: result.data.id, owner: "You", createdAt: now, updatedAt: now }
            set({ deals: [deal, ...get().deals] })
            return deal
          }
          toast.error("Couldn't save this deal — please try again")
          throw new Error(result.error)
        }

        const deal: Deal = { ...input, id: uid("deal"), owner: "You", createdAt: now, updatedAt: now }
        set({ deals: [deal, ...get().deals] })
        return deal
      },
      updateDealStage: (id, stage, probability) => {
        set({ deals: get().deals.map((d) => (d.id === id ? { ...d, stage, probability, updatedAt: new Date().toISOString() } : d)) })
        if (isSupabaseConfigured()) {
          updateDealStageAction(id, stage, probability).then((r) => { if (!r.success) toast.error("Couldn't sync this stage change") })
        }
      },
      updateDeal: (id, patch) => {
        set({ deals: get().deals.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)) })
        if (isSupabaseConfigured()) {
          updateDealAction(id, patch).then((r) => { if (!r.success) toast.error("Couldn't sync this deal") })
        }
      },
      deleteDeal: (id) => {
        set({ deals: get().deals.filter((d) => d.id !== id) })
        if (isSupabaseConfigured()) {
          deleteDealAction(id).then((r) => { if (!r.success) toast.error("Couldn't delete this deal") })
        }
      },
    }),
    { name: "growthos-crm-store" }
  )
)
