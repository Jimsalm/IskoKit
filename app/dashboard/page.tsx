import { redirect } from "next/navigation"

import { LogoutButton } from "@/features/auth/components/logout-button"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect("/login")
  }

  return (
    <main className="dark min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold">You are signed in.</h1>
          </div>
          <LogoutButton />
        </div>
      </section>
    </main>
  )
}
