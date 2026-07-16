"use client"
import * as React from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function RegeneratePopover({ onRegenerate, loading }: { onRegenerate: (note: string) => void; loading: boolean }) {
  const [note, setNote] = React.useState("")
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Regenerate
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Label className="text-xs">What should change?</Label>
        <Textarea
          className="mt-1.5"
          rows={3}
          placeholder="e.g. Make it punchier, lead with the statistic, shorten the intro…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          className="mt-2 w-full"
          size="sm"
          onClick={() => {
            onRegenerate(note)
            setNote("")
            setOpen(false)
          }}
        >
          Regenerate draft
        </Button>
      </PopoverContent>
    </Popover>
  )
}
