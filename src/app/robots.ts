import type { MetadataRoute } from "next"

const SITE_URL = "https://growthos.ai" // update to the real production domain on deploy

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/content-factory", "/social-media", "/analytics", "/seo-geo", "/reputation", "/competitor-intel", "/crm", "/brand-guardian", "/local-marketing", "/paid-ads", "/settings", "/onboarding", "/api"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
