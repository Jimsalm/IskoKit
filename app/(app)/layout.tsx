import type { ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { AppBackgroundPattern } from "@/features/app-shell/components/app-background-pattern"
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
      <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
        <AppSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <AppTopbar userEmail={userEmail} />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AppBackgroundPattern />
            <ScrollArea className="relative h-full">
              <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
              </main>
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppProviders>
  )
}
