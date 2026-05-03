import type { EmailOtpType } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

import {
  passwordRecoveryCookieName,
  passwordRecoveryMaxAge,
} from "@/features/auth/constants"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })

    if (!error) {
      if (type === "recovery") {
        const response = NextResponse.redirect(
          new URL("/reset-password", request.url),
        )

        response.cookies.set(passwordRecoveryCookieName, "1", {
          httpOnly: true,
          maxAge: passwordRecoveryMaxAge,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })

        return response
      }

      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.redirect(new URL("/login", request.url))
}
