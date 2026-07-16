import { getInitialCampaigns } from "@/lib/data/ads"
import { AdsClient } from "@/components/modules/ads/ads-client"

// Server Component fetch; campaigns and ad copy are fully real (no
// external ad-platform connection needed to create/manage them). Actual
// performance is a labeled seeded simulation — see engines/ads.
export default async function PaidAdsPage() {
  const campaigns = await getInitialCampaigns()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Paid Ads Manager</h1>
        <p className="text-sm text-muted mt-0.5">Cross-channel campaign creation, budget pacing, and optimization.</p>
      </div>
      <AdsClient initialCampaigns={campaigns} />
    </div>
  )
}
