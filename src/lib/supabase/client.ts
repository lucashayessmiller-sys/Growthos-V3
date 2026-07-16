"use client"
import { createBrowserClient } from "@supabase/ssr"
import { isSupabaseConfigured } from "./config"

// Returns null when no Supabase project is configured — callers must check
// isSupabaseConfigured() (or handle a null client) before use, keeping the
// demo store as the always-available fallback data layer.
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
