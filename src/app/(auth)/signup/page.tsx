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
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { signUpAction } from "@/app/actions/auth-actions"

export default function SignupPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const supabaseMode = isSupabaseConfigured()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (supabaseMode) {
      const result = await signUpAction(name, email, password)
      setLoading(false)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      // Most Supabase projects require email confirmation before a session
      // exists, so we can't assume the user is authenticated yet — send
      // them to log in rather than straight to onboarding.
      toast.success("Account created — check your email to confirm, then log in.")
      router.push("/login")
      return
    }

    setTimeout(() => {
      login(name || "New User", email || "you@company.com")
      toast.success("Workspace created")
      setLoading(false)
      router.push("/onboarding")
    }, 700)
  }

  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle className="text-xl">Create your workspace</CardTitle>
        <CardDescription>{supabaseMode ? "You'll set up your workspace after confirming your email." : "Demo mode — this creates a local sandbox workspace."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Reyes" required />
          </div>
          {!supabaseMode && (
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Northbound Outfitters" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={8} required={supabaseMode} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create workspace
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Already have a workspace? <Link href="/login" className="text-primary hover:underline">Log in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
