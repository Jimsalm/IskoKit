import type { ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { AppSidebar } from "@/features/app-shell/components/app-sidebar"
import { AppTopbar } from "@/features/app-shell/components/app-topbar"
import { AppProviders } from "@/features/app-shell/components/app-providers"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userEmail =
    typeof data?.claims?.email === "string" ? data.claims.email : null

  return (
    <AppProviders>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar userEmail={userEmail} />
          <ScrollArea className="min-h-0 flex-1">
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </AppProviders>
  )
}
