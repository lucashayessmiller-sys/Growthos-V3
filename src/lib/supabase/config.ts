// Central place to check whether a real Supabase project is connected.
// The entire app is designed to run with this returning false: data lives
// in the client-side zustand/localStorage demo store instead, so GrowthOS
// AI is fully interactive at zero infrastructure cost until you're ready
// to go multi-user / persistent.
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
