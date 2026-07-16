"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LayoutGrid, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { MODULE_GROUPS, MODULES } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { PulseLogo } from "@/components/shell/pulse-logo"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-5 py-5">
          <SheetTitle className="flex items-center gap-2">
            <PulseLogo className="h-6 w-6 text-primary" /> GrowthOS AI
          </SheetTitle>
        </SheetHeader>
        <nav className="px-3 pb-6 overflow-y-auto max-h-[calc(100svh-6rem)]">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className={cn("mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium", pathname === "/dashboard" ? "bg-primary/10 text-primary" : "hover:bg-surface-2")}
          >
            <LayoutGrid className="h-4 w-4" /> Overview
          </Link>
          {MODULE_GROUPS.map((group) => (
            <div key={group} className="mb-4">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{group}</p>
              {MODULES.filter((m) => m.group === group).map((m) => {
                const Icon = m.icon
                const active = pathname.startsWith(`/${m.slug}`)
                return (
                  <Link
                    key={m.slug}
                    href={`/${m.slug}`}
                    onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm", active ? "bg-primary/10 text-primary font-medium" : "hover:bg-surface-2")}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{m.shortName}</span>
                    {m.status === "soon" && <Lock className="h-3 w-3 text-muted" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
