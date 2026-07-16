import type { MetadataRoute } from "next"

const SITE_URL = "https://growthos.ai" // update to the real production domain on deploy

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/product", "/pricing", "/docs", "/privacy", "/terms", "/login", "/signup"]

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/product" || route === "/pricing" ? 0.8 : 0.5,
  }))
}
