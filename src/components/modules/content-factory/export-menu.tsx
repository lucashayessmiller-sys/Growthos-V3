"use client"
import { toast } from "sonner"
import { Download, Copy, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ExportMenu({ title, body }: { title: string; body: string }) {
  function download(ext: "md" | "txt") {
    const blob = new Blob([body], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported as .${ext}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(body); toast.success("Copied to clipboard") }}>
          <Copy className="mr-2 h-4 w-4" /> Copy to clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("md")}>
          <FileDown className="mr-2 h-4 w-4" /> Download as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("txt")}>
          <FileDown className="mr-2 h-4 w-4" /> Download as .txt
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
