"use client"
import { usePathname } from "next/navigation"
import { Bell, Search } from "lucide-react"
import { OrgSwitcher } from "@/components/shell/org-switcher"
import { ThemeToggle } from "@/components/shell/theme-toggle"
import { UserMenu } from "@/components/shell/user-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MODULES } from "@/lib/modules"
import { MobileNav } from "@/components/shell/mobile-nav"

export function Topbar() {
  const pathname = usePathname()
  const current = MODULES.find((m) => pathname.startsWith(`/${m.slug}`))
  const title = pathname === "/dashboard" ? "Overview" : current?.name ?? ""

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
      <MobileNav />
      <div className="lg:hidden"><OrgSwitcher /></div>
      <h1 className="hidden font-display text-lg font-semibold lg:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <Input placeholder="Search GrowthOS…" className="w-64 pl-8" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <div className="hidden lg:block"><OrgSwitcher /></div>
        <UserMenu />
      </div>
    </header>
  )
}
