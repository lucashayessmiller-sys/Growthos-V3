// Deterministic listing-completeness and NAP (Name/Address/Phone)
// consistency checking — no live Google Business Profile/Yelp/Apple Maps
// integration exists here (all require per-platform OAuth), so rather than
// fake a "synced" status, this scores what's actually checkable: whether
// each location's own record is complete, and whether phone-number
// formatting is consistent across locations (a well-known real local-SEO
// ranking factor).
import type { Location } from "@/lib/types"

export interface ListingCheck {
  label: string
  passed: boolean
}

export interface ListingCompletenessResult {
  score: number
  checks: ListingCheck[]
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

export function computeListingCompleteness(location: Location, allLocations: Location[]): ListingCompletenessResult {
  const checks: ListingCheck[] = [
    { label: "Full street address", passed: location.address.trim().length > 5 },
    { label: "City and region set", passed: !!location.city && !!location.region },
    { label: "Postal code set", passed: !!location.postalCode },
    { label: "Phone number set", passed: !!location.phone },
    { label: "Hours listed", passed: !!location.hours && location.hours.trim().length > 3 },
    { label: "Description written", passed: !!location.description && location.description.trim().length > 20 },
  ]

  // NAP consistency: phone format should match the pattern used elsewhere
  // in the org (e.g. not mixing "705-555-0142" with "(705) 555 0142").
  const others = allLocations.filter((l) => l.id !== location.id && l.phone)
  if (location.phone && others.length > 0) {
    const thisFormat = location.phone.replace(/\d/g, "#")
    const consistentFormat = others.some((o) => o.phone.replace(/\d/g, "#") === thisFormat)
    checks.push({ label: "Phone format consistent with other locations", passed: consistentFormat })
  }

  const passedCount = checks.filter((c) => c.passed).length
  return { score: Math.round((passedCount / checks.length) * 100), checks }
}

export interface NapIssue {
  locationA: string
  locationB: string
  message: string
}

// Cross-location NAP audit: flags duplicate-looking phone numbers with
// inconsistent formatting, which is exactly what confuses map-pack ranking.
export function auditNapConsistency(locations: Location[]): NapIssue[] {
  const issues: NapIssue[] = []
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const a = locations[i]
      const b = locations[j]
      if (!a.phone || !b.phone) continue
      if (normalizePhone(a.phone) === normalizePhone(b.phone) && a.phone !== b.phone) {
        issues.push({ locationA: a.name, locationB: b.name, message: `Same number, different formatting: "${a.phone}" vs "${b.phone}"` })
      }
    }
  }
  return issues
}
