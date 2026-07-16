// Structured data for SEO/AI-search visibility. Rendered as inline JSON-LD
// script tags — no external calls, purely descriptive of the product as
// built. No fabricated ratings, review counts, or customer data included.

const SITE_URL = "https://growthos.ai" // update to the real production domain on deploy

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GrowthOS AI",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "GrowthOS AI is an AI-first marketing operating system that unifies content, social, SEO, analytics, reputation, CRM, and more into one platform.",
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function SoftwareApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GrowthOS AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "An AI-first marketing operating system unifying content creation, social media, SEO, analytics, reputation management, CRM, and paid ads in one platform.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to start; see /pricing for full plan details.",
    },
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
