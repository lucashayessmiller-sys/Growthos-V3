"use client"
import * as React from "react"
import { toast } from "sonner"
import { MoreHorizontal, Trash2, Sparkles, Loader2, Star, Phone, Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LocationDialog } from "@/components/modules/local/location-dialog"
import { useLocalStore } from "@/store/local-store"
import { computeListingCompleteness } from "@/engines/local"
import type { Location } from "@/lib/types"
import type { LocationPerformance } from "@/lib/data/local"
import { generateLocationDescription } from "@/lib/ai/local-generate"

export function LocationCard({ location, allLocations, performance }: { location: Location; allLocations: Location[]; performance?: LocationPerformance }) {
  const updateLocation = useLocalStore((s) => s.updateLocation)
  const deleteLocation = useLocalStore((s) => s.deleteLocation)
  const [loading, setLoading] = React.useState(false)
  const { score, checks } = computeListingCompleteness(location, allLocations)

  async function handleGenerateDescription() {
    setLoading(true)
    try {
      const text = await generateLocationDescription(location)
      updateLocation(location.id, { description: text })
      toast.success("Description generated")
    } catch {
      toast.error("Couldn't generate a description — please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-sm font-semibold">{location.name}</p>
              <Badge variant={location.status === "active" ? "growth" : "outline"} className="text-[10px] capitalize">{location.status}</Badge>
            </div>
            {location.address && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {location.address}, {location.city}</p>
            )}
            {location.phone && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Phone className="h-3 w-3" /> {location.phone}</p>}
            {location.hours && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted"><Clock className="h-3 w-3" /> {location.hours}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <LocationDialog location={location} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>} />
              <DropdownMenuItem onClick={() => deleteLocation(location.id)} className="text-danger"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {performance && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber text-amber" />
            <span className="font-medium">{performance.avgRating}</span>
            <span className="text-muted">({performance.reviewCount} reviews)</span>
          </div>
        )}

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">Listing completeness</span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress value={score} indicatorClassName={score >= 80 ? "bg-growth" : score >= 50 ? "bg-amber" : "bg-danger"} />
          <ul className="mt-2 space-y-0.5">
            {checks.filter((c) => !c.passed).map((c) => (
              <li key={c.label} className="text-[11px] text-muted">· {c.label}</li>
            ))}
          </ul>
        </div>

        <div className="mt-3 border-t border-border pt-3">
          {location.description ? (
            <p className="text-xs text-foreground/80 line-clamp-3">{location.description}</p>
          ) : (
            <p className="text-xs text-muted italic">No listing description yet.</p>
          )}
          <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={handleGenerateDescription} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {location.description ? "Regenerate description" : "Generate description"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
