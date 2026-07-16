"use client"
import * as React from "react"
import Link from "next/link"
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, addMonths, subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PLATFORMS } from "@/lib/platforms"
import type { SocialPost } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CalendarView({ posts }: { posts: SocialPost[] }) {
  const [month, setMonth] = React.useState(new Date())

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  })

  const postsByDay = (day: Date) =>
    posts.filter((p) => {
      const date = p.scheduledFor ?? p.publishedAt
      return date && isSameDay(new Date(date), day)
    })

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="font-display text-sm font-semibold">{format(month, "MMMM yyyy")}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setMonth(new Date())}>Today</Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border text-center text-[11px] font-medium text-muted">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayPosts = postsByDay(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-24 border-b border-r border-border p-1.5 last:border-r-0",
                !isSameMonth(day, month) && "bg-surface-2/40"
              )}
            >
              <p className={cn("mb-1 text-[11px]", isSameDay(day, new Date()) ? "font-semibold text-primary" : "text-muted", !isSameMonth(day, month) && "opacity-40")}>
                {format(day, "d")}
              </p>
              <div className="space-y-1">
                {dayPosts.slice(0, 3).map((p) => {
                  const platform = PLATFORMS[p.platform]
                  const Icon = platform.icon
                  return (
                    <Link
                      key={p.id}
                      href={`/social-media/${p.id}`}
                      className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium truncate", platform.badgeClass)}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{p.title}</span>
                    </Link>
                  )
                })}
                {dayPosts.length > 3 && <p className="px-1.5 text-[10px] text-muted">+{dayPosts.length - 3} more</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
