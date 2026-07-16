"use client"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth-store"
import { CURRENT_USER } from "@/lib/demo-data"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { signOutAction } from "@/app/actions/auth-actions"

export function UserMenu() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const authedName = useAuthStore((s) => s.name)
  const supabaseMode = isSupabaseConfigured()

  const displayName = authedName || CURRENT_USER.name

  async function handleLogout() {
    if (supabaseMode) {
      await signOutAction()
      router.push("/login")
      router.refresh()
      return
    }
    logout()
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{CURRENT_USER.avatarInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{displayName}</p>
          <p className="text-xs font-normal text-muted">{CURRENT_USER.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
