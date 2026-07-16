import Link from "next/link"
import { PulseLogo } from "@/components/shell/pulse-logo"

const COLUMNS = [
  { title: "Product", links: [{ href: "/product", label: "Overview" }, { href: "/pricing", label: "Pricing" }, { href: "/docs", label: "Documentation" }] },
  { title: "Company", links: [{ href: "/docs", label: "Architecture" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }] },
  { title: "Get started", links: [{ href: "/signup", label: "Start free" }, { href: "/login", label: "Log in" }] },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <PulseLogo className="h-6 w-6 text-primary" />
              <span className="font-display text-sm font-semibold">GrowthOS AI</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              One AI marketing operating system — software, not services.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GrowthOS AI. All rights reserved.</p>
          <p>Built on Next.js, Supabase, and the Anthropic API.</p>
        </div>
      </div>
    </footer>
  )
}
