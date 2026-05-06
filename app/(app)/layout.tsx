import type { ReactNode } from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { AppProviders } from "@/features/app-shell/components/app-providers"
import { AppNavbar } from "@/features/app-shell/components/app-navbar"
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
    <div className="flex h-screen flex-col bg-background text-foreground">
      <AppNavbar userEmail={userEmail} />
      <AppProviders>
        <ScrollArea className="min-h-0 flex-1">
          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
            {children}
          </main>
        </ScrollArea>
      </AppProviders>
    </div>
  )
}
