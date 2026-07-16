import { FileText, MessageSquare, Mail, Megaphone, LayoutTemplate, Award, Newspaper } from "lucide-react"
import type { ContentType } from "@/lib/types"

export const typeIcons: Record<ContentType, typeof FileText> = {
  blog: FileText,
  social: MessageSquare,
  email: Mail,
  ad: Megaphone,
  landing: LayoutTemplate,
  "case-study": Award,
  newsletter: Newspaper,
}

export const typeLabels: Record<ContentType, string> = {
  blog: "Blog post",
  social: "Social post",
  email: "Email",
  ad: "Ad copy",
  landing: "Landing page",
  "case-study": "Case study",
  newsletter: "Newsletter",
}
