import { redirect } from "next/navigation"

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"
import { createClient } from "@/lib/supabase/server"

export default async function ForgotPasswordPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard")
  }

  return (
    <main className="dark grid min-h-screen place-items-center bg-background px-4 py-10">
      <ForgotPasswordForm />
    </main>
  )
}
