import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { passwordRecoveryCookieName } from "@/features/auth/constants"
import { createClient } from "@/lib/supabase/server"

export default async function ResetPasswordPage() {
  const cookieStore = await cookies()
  const hasRecoverySession = Boolean(
    cookieStore.get(passwordRecoveryCookieName)?.value,
  )

  if (!hasRecoverySession) {
    redirect("/forgot-password")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect("/forgot-password")
  }

  return (
    <main className="dark grid min-h-screen place-items-center bg-background px-4 py-10">
      <ResetPasswordForm />
    </main>
  )
}
