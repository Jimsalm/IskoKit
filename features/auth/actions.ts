"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { loginSchema, registerSchema } from "@/features/auth/schemas"
import { createClient } from "@/lib/supabase/server"

export type LoginActionState = {
  message: string
  errors?: {
    email?: string[]
    password?: string[]
  }
}

export type RegisterActionState = {
  message: string
  success?: boolean
  errors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
  }
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return {
      message: error.message,
    }
  }

  redirect("/dashboard")
}

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return {
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const origin = (await headers()).get("origin")
  const supabase = await createClient()

  const { email, password } = parsed.data
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: origin
      ? {
          emailRedirectTo: `${origin}/auth/confirm`,
        }
      : undefined,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  if (!data.session) {
    return {
      success: true,
      message: "Check your email to confirm your account.",
    }
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/login")
}
