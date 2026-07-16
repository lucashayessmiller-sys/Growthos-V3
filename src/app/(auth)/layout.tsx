import { PulseLogo } from "@/components/shell/pulse-logo"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background px-4 bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <PulseLogo className="h-8 w-8 text-primary" />
          <span className="font-display text-lg font-semibold">GrowthOS <span className="text-gradient-signal">AI</span></span>
        </Link>
        {children}
      </div>
    </div>
  )
}
