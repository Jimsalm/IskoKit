import { redirect } from "next/navigation"

import { RegisterForm } from "@/features/auth/components/register-form"
import { createClient } from "@/lib/supabase/server"

export default async function RegisterPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/dashboard")
  }

  return (
    <main className="dark grid min-h-screen place-items-center bg-background px-4 py-10">
      <RegisterForm />
    </main>
  )
}
