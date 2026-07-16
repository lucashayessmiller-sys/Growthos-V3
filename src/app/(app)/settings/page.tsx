"use client"
import * as React from "react"
import { toast } from "sonner"
import { CreditCard, Shield, User, Building2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DEMO_ORG, DEMO_USERS, CURRENT_USER } from "@/lib/demo-data"

const PLANS = [
  { name: "Starter", price: "$149/mo", modules: "3 modules", highlight: false },
  { name: "Growth", price: "$449/mo", modules: "8 modules", highlight: true },
  { name: "Scale", price: "$1,200/mo", modules: "All 15 modules", highlight: false },
  { name: "Enterprise", price: "Custom", modules: "All modules + SSO, SLAs", highlight: false },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Owner: ["Full access to all modules", "Manage billing & plan", "Manage roles & members", "Approve & publish content"],
  Admin: ["Manage all modules", "Invite & manage members", "Approve & publish content"],
  Editor: ["Create & edit content", "Request approval", "View analytics"],
  Contributor: ["Create drafts only", "No publish access"],
  Viewer: ["Read-only access to dashboards & reports"],
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-muted mb-6">Manage your profile, workspace, team access, and billing.</p>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="org"><Building2 className="h-3.5 w-3.5" /> Workspace</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="h-3.5 w-3.5" /> Roles</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="h-3.5 w-3.5" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>This is how you appear across GrowthOS AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14"><AvatarFallback className="text-base">{CURRENT_USER.avatarInitials}</AvatarFallback></Avatar>
                <Button variant="outline" size="sm">Change photo</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input defaultValue={CURRENT_USER.name} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue={CURRENT_USER.email} type="email" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success("Profile updated")}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="org">
          <Card>
            <CardHeader>
              <CardTitle>Workspace details</CardTitle>
              <CardDescription>Shared across every module in this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Workspace name</Label>
                  <Input defaultValue={DEMO_ORG.name} />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input defaultValue={DEMO_ORG.industry} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Workspace URL</Label>
                <Input defaultValue={`app.growthos.ai/${DEMO_ORG.slug}`} disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success("Workspace updated")}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>Role-based permissions apply across all modules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {DEMO_USERS.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-surface-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback>{u.avatarInitials}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                  <Select defaultValue={u.role}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(ROLE_PERMISSIONS).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Separator className="my-4" />
              <p className="text-sm font-medium mb-2">What each role can do</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
                  <div key={role} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium mb-1.5">{role}</p>
                    <ul className="space-y-1">
                      {perms.map((p) => <li key={p} className="text-xs text-muted">· {p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => toast.success("Invite sent")}>+ Invite member</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Plan & billing</CardTitle>
              <CardDescription>You&apos;re currently on the {DEMO_ORG.plan} plan. This is a demo placeholder — connect Stripe to enable real billing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PLANS.map((p) => (
                  <div key={p.name} className={`rounded-xl border p-4 ${p.highlight ? "border-primary bg-primary/5" : "border-border"}`}>
                    {p.highlight && <Badge className="mb-2">Current plan</Badge>}
                    <p className="font-display font-semibold">{p.name}</p>
                    <p className="font-mono-data text-lg mt-1">{p.price}</p>
                    <p className="text-xs text-muted mt-1">{p.modules}</p>
                    <Button variant={p.highlight ? "secondary" : "outline"} size="sm" className="mt-3 w-full" disabled={p.highlight}>
                      {p.highlight ? "Current" : "Switch plan"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
