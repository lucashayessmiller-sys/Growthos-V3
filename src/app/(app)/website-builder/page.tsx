import { ComingSoon } from "@/components/shell/coming-soon"
import { getModule } from "@/lib/modules"
import { notFound } from "next/navigation"

export default function Page() {
  const mod = getModule("website-builder")
  if (!mod) return notFound()
  return <ComingSoon module={mod} />
}
