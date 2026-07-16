import { getInitialDesigns } from "@/lib/data/creative"
import { CreativeClient } from "@/components/modules/creative/creative-client"
import { NewDesignDialog } from "@/components/modules/creative/new-design-dialog"

export default async function CreativeStudioPage() {
  const designs = await getInitialDesigns()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Creative Studio</h1>
          <p className="text-sm text-muted mt-0.5">Design social graphics, ad creatives, and banners with your brand colors.</p>
        </div>
        <NewDesignDialog />
      </div>
      <CreativeClient initialDesigns={designs} />
    </div>
  )
}
