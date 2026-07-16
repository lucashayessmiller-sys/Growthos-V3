"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import type { SocialBrief, SocialPost, SocialStatus, SocialVersion } from "@/lib/types"
import { seedSocialPosts } from "@/lib/demo-data"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import {
  createSocialPostAction, addSocialVersionAction, setActiveSocialVersionAction, updateSocialStatusAction,
  updateSocialBriefAction, editSocialVersionCaptionAction, scheduleSocialPostAction, removeSocialPostAction,
} from "@/app/actions/social-actions"

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

// Same persistence strategy as content-store.ts — see the comment there.

interface SocialStore {
  posts: SocialPost[]
  hydrated: boolean
  hydrate: (initialItems?: SocialPost[]) => void
  createFromBrief: (brief: SocialBrief, caption: string, hashtags: string[]) => Promise<SocialPost>
  addVersion: (postId: string, caption: string, hashtags: string[], note: string, generatedBy?: "ai" | "human") => void
  setActiveVersion: (postId: string, versionId: string) => void
  updateStatus: (postId: string, status: SocialStatus) => void
  updateBrief: (postId: string, brief: SocialBrief) => void
  editActiveVersionCaption: (postId: string, caption: string) => void
  schedulePost: (postId: string, isoDate: string) => void
  removePost: (postId: string) => void
}

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      posts: [],
      hydrated: false,
      hydrate: (initialItems) => {
        if (isSupabaseConfigured()) {
          set({ posts: initialItems ?? get().posts, hydrated: true })
        } else if (get().posts.length === 0) {
          set({ posts: initialItems ?? seedSocialPosts(), hydrated: true })
        } else {
          set({ hydrated: true })
        }
      },
      createFromBrief: async (brief, caption, hashtags) => {
        const now = new Date().toISOString()

        if (isSupabaseConfigured()) {
          const result = await createSocialPostAction(brief, caption, hashtags)
          if (result.success) {
            const post: SocialPost = {
              id: result.data.id,
              title: brief.topic,
              platform: brief.platform,
              mediaType: brief.mediaType,
              status: "draft",
              brief,
              activeVersionId: result.data.versionId,
              versions: [{ id: result.data.versionId, createdAt: now, caption, hashtags, note: "Initial AI draft", generatedBy: "ai" }],
              campaign: "Unassigned",
              owner: "You",
              createdAt: now,
              updatedAt: now,
              tags: [],
            }
            set({ posts: [post, ...get().posts] })
            return post
          }
          toast.error("Couldn't save to your workspace — please try again")
          throw new Error(result.error)
        }

        const versionId = uid("v")
        const post: SocialPost = {
          id: uid("sp"),
          title: brief.topic,
          platform: brief.platform,
          mediaType: brief.mediaType,
          status: "draft",
          brief,
          activeVersionId: versionId,
          versions: [{ id: versionId, createdAt: now, caption, hashtags, note: "Initial AI draft", generatedBy: "ai" }],
          campaign: "Unassigned",
          owner: "You",
          createdAt: now,
          updatedAt: now,
          tags: [],
        }
        set({ posts: [post, ...get().posts] })
        return post
      },
      addVersion: (postId, caption, hashtags, note, generatedBy = "ai") => {
        const version: SocialVersion = { id: uid("v"), createdAt: new Date().toISOString(), caption, hashtags, note, generatedBy }
        set({
          posts: get().posts.map((p) =>
            p.id === postId ? { ...p, versions: [...p.versions, version], activeVersionId: version.id, updatedAt: version.createdAt } : p
          ),
        })
        if (isSupabaseConfigured()) {
          addSocialVersionAction(postId, caption, hashtags, note, generatedBy).then((r) => {
            if (!r.success) toast.error("Couldn't sync this version to your workspace")
          })
        }
      },
      setActiveVersion: (postId, versionId) => {
        set({ posts: get().posts.map((p) => (p.id === postId ? { ...p, activeVersionId: versionId } : p)) })
        if (isSupabaseConfigured()) {
          setActiveSocialVersionAction(postId, versionId).then((r) => {
            if (!r.success) toast.error("Couldn't sync this change to your workspace")
          })
        }
      },
      updateStatus: (postId, status) => {
        set({
          posts: get().posts.map((p) => {
            if (p.id !== postId) return p
            const publishedAt = status === "published" ? new Date().toISOString() : p.publishedAt
            const engagement = status === "published" && !p.engagement
              ? {
                  likes: Math.floor(80 + Math.random() * 900),
                  comments: Math.floor(2 + Math.random() * 60),
                  shares: Math.floor(1 + Math.random() * 40),
                  reach: Math.floor(1200 + Math.random() * 9000),
                  saves: Math.floor(0 + Math.random() * 120),
                }
              : p.engagement
            return { ...p, status, updatedAt: new Date().toISOString(), publishedAt, engagement }
          }),
        })
        if (isSupabaseConfigured()) {
          updateSocialStatusAction(postId, status).then((r) => {
            if (!r.success) toast.error("Couldn't sync this status change to your workspace")
          })
        }
      },
      updateBrief: (postId, brief) => {
        set({ posts: get().posts.map((p) => (p.id === postId ? { ...p, brief, title: brief.topic, platform: brief.platform, mediaType: brief.mediaType } : p)) })
        if (isSupabaseConfigured()) {
          updateSocialBriefAction(postId, brief).then((r) => {
            if (!r.success) toast.error("Couldn't sync this brief to your workspace")
          })
        }
      },
      editActiveVersionCaption: (postId, caption) => {
        const post = get().posts.find((p) => p.id === postId)
        set({
          posts: get().posts.map((p) => {
            if (p.id !== postId) return p
            return { ...p, updatedAt: new Date().toISOString(), versions: p.versions.map((v) => (v.id === p.activeVersionId ? { ...v, caption, generatedBy: "human" as const } : v)) }
          }),
        })
        if (isSupabaseConfigured() && post) {
          editSocialVersionCaptionAction(post.activeVersionId, postId, caption).then((r) => {
            if (!r.success) toast.error("Couldn't sync this edit to your workspace")
          })
        }
      },
      schedulePost: (postId, isoDate) => {
        set({ posts: get().posts.map((p) => (p.id === postId ? { ...p, status: "scheduled", scheduledFor: isoDate, updatedAt: new Date().toISOString() } : p)) })
        if (isSupabaseConfigured()) {
          scheduleSocialPostAction(postId, isoDate).then((r) => {
            if (!r.success) toast.error("Couldn't sync the schedule to your workspace")
          })
        }
      },
      removePost: (postId) => {
        set({ posts: get().posts.filter((p) => p.id !== postId) })
        if (isSupabaseConfigured()) {
          removeSocialPostAction(postId).then((r) => {
            if (!r.success) toast.error("Couldn't delete this from your workspace")
          })
        }
      },
    }),
    { name: "growthos-social-store" }
  )
)
