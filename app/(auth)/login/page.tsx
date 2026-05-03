import { redirect } from "next/navigation"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { LoginForm } from "@/features/auth/components/login-form"
import { createClient } from "@/lib/supabase/server"

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
