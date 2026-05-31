import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { LoginForm } from "@/features/auth/components/login-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard")
  }

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  )
}
