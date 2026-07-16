"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Lock } from "lucide-react"
import { MODULE_GROUPS, MODULES } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PulseLogo } from "@/components/shell/pulse-logo"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <PulseLogo className="h-7 w-7 text-primary" />
        <span className="font-display text-[15px] font-semibold tracking-tight">GrowthOS <span className="text-gradient-signal">AI</span></span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <Link
          href="/dashboard"
          className={cn(
            "mb-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard" ? "bg-primary/10 text-primary" : "hover:bg-surface-2"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Overview
        </Link>

        {MODULE_GROUPS.map((group) => (
          <div key={group} className="mb-4">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{group}</p>
            <div className="flex flex-col gap-0.5">
              {MODULES.filter((m) => m.group === group).map((m) => {
                const href = `/${m.slug}`
                const active = pathname.startsWith(href)
                const Icon = m.icon
                return (
                  <Link
                    key={m.slug}
                    href={href}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground/90 hover:bg-surface-2"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{m.shortName}</span>
                    {m.status === "soon" && (
                      <Lock className="h-3 w-3 text-muted opacity-70 group-hover:opacity-100" />
                    )}
                    {m.status === "beta" && (
                      <Badge variant="amber" className="px-1.5 py-0 text-[10px]">Beta</Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="rounded-lg bg-surface-2 p-3">
          <p className="text-xs font-medium">Growth plan</p>
          <p className="text-[11px] text-muted mt-0.5">{MODULES.filter((m) => m.status === "live").length} of {MODULES.length} modules live</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted-2">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(MODULES.filter((m) => m.status === "live").length / MODULES.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
