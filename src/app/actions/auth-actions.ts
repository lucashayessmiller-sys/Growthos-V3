"use server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type ActionResult = { success: true } | { success: false; error: string }

export async function signUpAction(name: string, email: string, password: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function signInAction(email: string, password: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return { success: false, error: "Supabase not configured" }

  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, error: error.message }
  return { success: true }
}
