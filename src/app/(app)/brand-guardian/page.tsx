import { getBrandKit } from "@/lib/data/brand"
import { getInitialContentItems } from "@/lib/data/content"
import { getInitialSocialPosts } from "@/lib/data/social"
import { BrandGuardianClient } from "@/components/modules/brand/brand-guardian-client"

// Server Component fetches the brand kit and real content/social data;
// the actual compliance scan runs client-side (see BrandGuardianClient)
// so that editing the brand kit re-scans immediately, in both demo and
// Supabase modes, without a server round-trip.
export default async function BrandGuardianPage() {
  const [brandKit, pieces, posts] = await Promise.all([getBrandKit(), getInitialContentItems(), getInitialSocialPosts()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Brand Guardian</h1>
        <p className="text-sm text-muted mt-0.5">Keep every asset and message on-brand with automated compliance checks.</p>
      </div>
      <BrandGuardianClient initialBrandKit={brandKit} pieces={pieces} posts={posts} />
    </div>
  )
}
