"use server"

import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"

import { passwordRecoveryCookieName } from "@/features/auth/constants"
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas"
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

export type ForgotPasswordActionState = {
  message: string
  success?: boolean
  errors?: {
    email?: string[]
  }
}

export type ResetPasswordActionState = {
  message: string
  errors?: {
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

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return {
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const origin = (await headers()).get("origin")
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    origin
      ? {
          redirectTo: `${origin}/auth/confirm`,
        }
      : undefined,
  )

  if (error) {
    return {
      message: error.message,
    }
  }

  return {
    success: true,
    message: "Check your email for a password reset link.",
  }
}

export async function resetPasswordAction(
  _prevState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return {
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    }
  }

  const cookieStore = await cookies()
  const hasRecoverySession = Boolean(
    cookieStore.get(passwordRecoveryCookieName)?.value,
  )

  if (!hasRecoverySession) {
    return {
      message: "Use the password reset link from your email to continue.",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return {
      message: error.message,
    }
  }

  cookieStore.set(passwordRecoveryCookieName, "", {
    path: "/",
    maxAge: 0,
  })

  await supabase.auth.signOut()

  redirect("/login")
}
