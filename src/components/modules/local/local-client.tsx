"use client"
import * as React from "react"
import { LocalKpiCards } from "@/components/modules/local/kpi-cards"
import { NapAudit } from "@/components/modules/local/nap-audit"
import { LocationCard } from "@/components/modules/local/location-card"
import { LocationDialog } from "@/components/modules/local/location-dialog"
import { useLocalStore } from "@/store/local-store"
import { computeListingCompleteness, auditNapConsistency } from "@/engines/local"
import type { Location } from "@/lib/types"
import type { LocationPerformance } from "@/lib/data/local"

export function LocalClient({ initialLocations, performance }: { initialLocations: Location[]; performance: LocationPerformance[] }) {
  const locations = useLocalStore((s) => s.locations)
  const hydrated = useLocalStore((s) => s.hydrated)
  const hydrate = useLocalStore((s) => s.hydrate)
  React.useEffect(() => { hydrate(initialLocations) }, [hydrate, initialLocations])

  const source = hydrated ? locations : initialLocations
  const napIssues = auditNapConsistency(source)
  const avgCompleteness = source.length ? Math.round(source.reduce((s, l) => s + computeListingCompleteness(l, source).score, 0) / source.length) : 0
  const avgRating = performance.length ? Math.round((performance.reduce((s, p) => s + p.avgRating * p.reviewCount, 0) / performance.reduce((s, p) => s + p.reviewCount, 0)) * 10) / 10 : 0

  return (
    <div className="space-y-5">
      <LocalKpiCards locationCount={source.length} avgCompleteness={avgCompleteness} napIssueCount={napIssues.length} avgRating={avgRating} />

      <div className="flex items-center justify-end">
        <LocationDialog />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {source.map((loc) => (
          <LocationCard key={loc.id} location={loc} allLocations={source} performance={performance.find((p) => p.locationName === loc.name)} />
        ))}
      </div>
      {source.length === 0 && <p className="py-8 text-center text-sm text-muted">No locations yet — add your first one above.</p>}

      <NapAudit issues={napIssues} />
    </div>
  )
}
