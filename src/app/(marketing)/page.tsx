import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, CheckCircle2, Cpu, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MODULES } from "@/lib/modules"
import { FaqJsonLd } from "@/components/marketing/json-ld"

export const metadata: Metadata = {
  title: "GrowthOS AI — The AI Marketing Operating System",
  description: "Replace fragmented marketing tools and agency retainers with one AI-run platform: content, social, SEO, analytics, reputation, CRM, local marketing, and paid ads.",
  openGraph: {
    title: "GrowthOS AI — The AI Marketing Operating System",
    description: "One AI-run platform for content, social, SEO, analytics, reputation, CRM, local marketing, and paid ads.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "GrowthOS AI", description: "The AI marketing operating system." },
}

const liveModules = MODULES.filter((m) => m.status === "live")

const FAQS = [
