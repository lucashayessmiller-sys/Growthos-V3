import { getReputationSnapshot } from "@/lib/data/reputation"
import { ReputationStatsCards } from "@/components/modules/reputation/stats-cards"
import { RatingChart } from "@/components/modules/reputation/rating-chart"
import { ReputationClient } from "@/components/modules/reputation/reputation-client"

// Server Component fetch; reviews are seeded/stable (no live review-platform
// integration — see engines/reputation/seed.ts), responses are real and
// persist through Supabase when configured (see lib/data/reputation.ts).
export default async function ReputationPage() {
  const { reviews, stats } = await getReputationSnapshot()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Reputation Manager</h1>
        <p className="text-sm text-muted mt-0.5">Monitor and respond to reviews across every platform, on-brand.</p>
      </div>

      <div className="space-y-5">
        <ReputationStatsCards stats={stats} />
        <RatingChart stats={stats} />
        <ReputationClient reviews={reviews} />
      </div>
    </div>
  )
}
