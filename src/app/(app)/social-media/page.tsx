import { SocialMediaClient } from "@/components/modules/social-media/social-media-client"
import { getInitialSocialPosts } from "@/lib/data/social"

export default async function SocialMediaPage() {
  const initialItems = await getInitialSocialPosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <SocialMediaClient initialItems={initialItems} />
    </div>
  )
}
