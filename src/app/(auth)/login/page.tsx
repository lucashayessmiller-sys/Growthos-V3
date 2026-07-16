"use client"
import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth-store"
import { CURRENT_USER } from "@/lib/demo-data"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { signInAction } from "@/app/actions/auth-actions"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const supabaseMode = isSupabaseConfigured()
  const [email, setEmail] = React.useState(supabaseMode ? "" : CURRENT_USER.email)
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (supabaseMode) {
      const result = await signInAction(email, password)
      setLoading(false)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Welcome back to GrowthOS AI")
      router.push("/dashboard")
      router.refresh()
      return
    }

    setTimeout(() => {
      login(CURRENT_USER.name, email || CURRENT_USER.email)
      toast.success("Welcome back to GrowthOS AI")
      setLoading(false)
      router.push("/dashboard")
    }, 600)
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle className="text-xl">Log in to your workspace</CardTitle>
        <CardDescription>{supabaseMode ? "Sign in with your email and password." : "Demo mode — any email and password will work."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Don&apos;t have a workspace? <Link href="/signup" className="text-primary hover:underline">Start free</Link>
        </p>
      </CardContent>
    </Card>
  )
}
