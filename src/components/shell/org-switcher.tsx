"use client"
import { ChevronsUpDown, Check, Plus } from "lucide-react"
import { DEMO_ORG } from "@/lib/demo-data"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function OrgSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm hover:bg-surface-2 transition-colors">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-growth/15 text-growth text-[11px] font-semibold">
          {DEMO_ORG.logoInitials}
        </div>
        <span className="hidden sm:inline font-medium">{DEMO_ORG.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center justify-between">
          <span>{DEMO_ORG.name}</span>
          <Check className="h-4 w-4 text-primary" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted">
          <Plus className="mr-2 h-4 w-4" /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
