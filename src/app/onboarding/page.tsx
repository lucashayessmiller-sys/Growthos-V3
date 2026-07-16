"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { PulseLogo } from "@/components/shell/pulse-logo"
import { cn } from "@/lib/utils"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createOrganizationAction } from "@/app/actions/onboarding-actions"

const TONES = ["Professional", "Friendly", "Bold", "Playful", "Authoritative", "Empathetic"]
const CHANNELS = ["Website", "Blog / SEO", "Email", "Instagram", "Facebook", "LinkedIn", "TikTok", "Google Ads"]

export default function OnboardingPage() {
  const router = useRouter()
  const supabaseMode = isSupabaseConfigured()
  const [step, setStep] = React.useState(0)
  const [company, setCompany] = React.useState(supabaseMode ? "" : "Northbound Outfitters")
  const [industry, setIndustry] = React.useState(supabaseMode ? "" : "Outdoor & Lifestyle Retail")
  const [tone, setTone] = React.useState("Friendly")
  const [channels, setChannels] = React.useState<string[]>(["Website", "Blog / SEO", "Instagram"])
  const [finishing, setFinishing] = React.useState(false)

  const steps = ["Your brand", "Brand voice", "Channels", "You're set"]
  const progress = ((step + 1) / steps.length) * 100

  function toggleChannel(c: string) {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  async function finishOnboarding() {
    if (!supabaseMode) {
      router.push("/dashboard")
      return
    }
    setFinishing(true)
    const result = await createOrganizationAction(company || "My Workspace", industry)
    setFinishing(false)
    if (!result.success) {
      toast.error(result.error === "Not signed in" ? "Please log in first, then finish setup." : result.error)
      if (result.error === "Not signed in") router.push("/login")
      return
    }
    toast.success("Workspace created")
    router.push("/dashboard")
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <PulseLogo className="h-7 w-7 text-primary" />
        <span className="font-display text-base font-semibold">GrowthOS <span className="text-gradient-signal">AI</span></span>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card className="animate-fade-up">
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Tell us about your brand</CardTitle>
              <CardDescription>This sets the context every AI module uses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Company name</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>What&apos;s your brand voice?</CardTitle>
              <CardDescription>Every AI-generated draft will default to this tone — you can override it per piece.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      tone === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-2"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Which channels do you use?</CardTitle>
              <CardDescription>We&apos;ll tailor content types and templates to these.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CHANNELS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleChannel(c)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      channels.includes(c) ? "border-growth bg-growth/10 text-growth" : "border-border hover:bg-surface-2"
                    )}
                  >
                    {channels.includes(c) && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {c}
                  </button>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-growth/15 text-growth">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3">You&apos;re all set, {company.split(" ")[0]}</CardTitle>
              <CardDescription>Content Factory is ready with your brand voice ({tone}) applied by default.</CardDescription>
            </CardHeader>
          </>
        )}

        <CardContent className="flex items-center justify-between border-t border-border pt-5">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && supabaseMode && !company.trim()}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finishOnboarding} disabled={finishing}>
              {finishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Go to dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
