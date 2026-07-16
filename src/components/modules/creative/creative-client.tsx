"use client"
import * as React from "react"
import { Palette } from "lucide-react"
import { DesignCard } from "@/components/modules/creative/design-card"
import { NewDesignDialog } from "@/components/modules/creative/new-design-dialog"
import { useCreativeStore } from "@/store/creative-store"
import type { CreativeDesign } from "@/lib/types"

export function CreativeClient({ initialDesigns }: { initialDesigns: CreativeDesign[] }) {
  const designs = useCreativeStore((s) => s.designs)
  const hydrated = useCreativeStore((s) => s.hydrated)
  const hydrate = useCreativeStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialDesigns) }, [hydrate, initialDesigns])

  const source = hydrated ? designs : initialDesigns

  if (source.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Palette className="h-8 w-8 text-muted" />
        <p className="mt-3 font-display text-sm font-semibold">No designs yet</p>
        <p className="mt-1 max-w-xs text-sm text-muted">Create social graphics, ad creatives, or banners with text, shapes, and your brand colors.</p>
        <div className="mt-4"><NewDesignDialog /></div>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {source.map((d) => <DesignCard key={d.id} design={d} />)}
    </div>
  )
}
