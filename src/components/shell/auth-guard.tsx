"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const demoAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [mounted, setMounted] = React.useState(false)
  const [supabaseAuthenticated, setSupabaseAuthenticated] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard mount-detection pattern; auth state resolves on the client only
    setMounted(true)

    if (!isSupabaseConfigured()) return

    const supabase = createSupabaseBrowserClient()
    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => setSupabaseAuthenticated(!!data.user))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseAuthenticated(!!session?.user)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  const isAuthenticated = isSupabaseConfigured() ? supabaseAuthenticated : demoAuthenticated

  React.useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/login")
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated) return null
  return <>{children}</>
}
