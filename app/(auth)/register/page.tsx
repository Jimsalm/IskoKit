import { redirect } from "next/navigation"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { RegisterForm } from "@/features/auth/components/register-form"
import { createClient } from "@/lib/supabase/server"

export default async function RegisterPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard")
  }

  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  )
}
