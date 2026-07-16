"use client"
import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CanvasEditor } from "@/components/modules/creative/canvas-editor"
import { useCreativeStore } from "@/store/creative-store"

// Client component: the editor needs heavy interactivity (drag, canvas
// export), and — unlike Content Factory/Social Media — Creative Studio has
// no demo seed data (there's no natural "sample design" to fabricate), so
// this looks the design up from whatever's in the store rather than a
// server-fetched prop specific to this id.
export default function CreativeEditorPage() {
  const params = useParams<{ id: string }>()
  const designs = useCreativeStore((s) => s.designs)
  const hydrate = useCreativeStore((s) => s.hydrate)
  React.useEffect(() => { hydrate() }, [hydrate])

  const design = designs.find((d) => d.id === params.id)

  if (!design) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-muted">This design doesn&apos;t exist, or hasn&apos;t loaded in this session yet.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/creative-studio">Back to Creative Studio</Link>
        </Button>
      </div>
    )
  }

  return <CanvasEditor design={design} key={design.id} />
}
