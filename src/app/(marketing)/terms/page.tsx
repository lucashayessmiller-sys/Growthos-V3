import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms of Service — GrowthOS AI", description: "GrowthOS AI terms of service." }

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: placeholder — replace with your actual terms before launch.</p>

      <div className="mt-8 space-y-6 text-sm text-muted leading-relaxed">
        <p>
          This is placeholder content. Before making GrowthOS AI publicly available, replace this page with terms of
          service reviewed by qualified counsel, covering at minimum: acceptable use, ownership of content generated
          through the platform, subscription/billing terms once real billing is connected, liability limitations, and
          termination conditions.
        </p>
      </div>
    </div>
  )
}
