import { ContentFactoryClient } from "@/components/modules/content-factory/content-factory-client"
import { getInitialContentItems } from "@/lib/data/content"

// Server Component: fetches the first paint of data on the server (from
// Supabase once connected, or the deterministic demo seed otherwise) and
// hands it to a small client component that owns the interactive
// filtering/search state and syncs it into the zustand store.
export default async function ContentFactoryPage() {
  const initialItems = await getInitialContentItems()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <ContentFactoryClient initialItems={initialItems} />
    </div>
  )
}
