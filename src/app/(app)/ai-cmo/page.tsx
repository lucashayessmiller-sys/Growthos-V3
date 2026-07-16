import { getBusinessSnapshot, getCmoBrief } from "@/lib/data/cmo"
import { SignalCards } from "@/components/modules/cmo/signal-cards"
import { BriefPanel } from "@/components/modules/cmo/brief-panel"

// Server Component: every signal is fetched via the real data-access
// function each other module already uses — this page's only new logic is
// composition (see lib/data/cmo.ts). The brief itself is the one client
// boundary, since it needs the generate/regenerate/edit/approve workflow.
export default async function AiCmoPage() {
  const [snapshot, brief] = await Promise.all([getBusinessSnapshot(), getCmoBrief()])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">AI CMO</h1>
        <p className="text-sm text-muted mt-0.5">Your always-on Chief Marketing Officer — strategy, planning, and cross-module orchestration.</p>
      </div>

      <div className="space-y-5">
        <SignalCards signals={snapshot.signals} />
        <BriefPanel snapshot={snapshot} initialBrief={brief} />
      </div>
    </div>
  )
}
