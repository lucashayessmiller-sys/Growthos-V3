import { getInitialLocations, getLocationPerformance } from "@/lib/data/local"
import { LocalClient } from "@/components/modules/local/local-client"

// Server Component fetch; locations are fully real (no external API
// needed), and performance is a real aggregation of Reputation Manager's
// review data by location — no new review data invented here.
export default async function LocalMarketingPage() {
  const [locations, performance] = await Promise.all([getInitialLocations(), getLocationPerformance()])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Local Marketing Suite</h1>
        <p className="text-sm text-muted mt-0.5">Listings, local SEO, and geo-targeted campaigns for multi-location brands.</p>
      </div>
      <LocalClient initialLocations={locations} performance={performance} />
    </div>
  )
}
