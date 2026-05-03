import type { ReactNode } from "react"

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
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar userEmail={userEmail} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
