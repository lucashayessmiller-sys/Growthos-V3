import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isSupabaseConfigured } from "./config"

// Refreshes the Supabase auth session on every request so Server Components
// always see an up-to-date cookie. No-ops entirely when Supabase isn't
// configured, so this costs nothing in demo mode.
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  if (!isSupabaseConfigured()) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Touching getUser() is what actually triggers the token refresh.
  await supabase.auth.getUser()

  return response
}
