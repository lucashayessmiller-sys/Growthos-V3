import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy Policy — GrowthOS AI", description: "GrowthOS AI privacy policy." }

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: placeholder — replace with your actual policy before launch.</p>

      <div className="mt-8 space-y-6 text-sm text-muted leading-relaxed">
        <p>
          This is placeholder content. Before making GrowthOS AI publicly available, replace this page with a privacy
          policy reviewed by qualified counsel, covering at minimum: what data is collected (account information,
          content you create, usage analytics), how it&apos;s stored (Supabase, if configured), how AI providers process
          content sent for generation, data retention and deletion, and user rights under applicable law (e.g. GDPR, CCPA).
        </p>
        <p>
          If you connect a Supabase project, your organization becomes the data controller for what your users store —
          your privacy policy should reflect that relationship accurately.
        </p>
      </div>
    </div>
  )
}
