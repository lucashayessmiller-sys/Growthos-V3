import { cn } from "@/lib/utils"

export function PulseLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn(className)} xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" className="fill-primary/15" />
      <path
        d="M4 17h4l2.5-7 4 14 3-10 2 3h8.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="48"
        className="animate-pulse-line"
      />
    </svg>
  )
}
