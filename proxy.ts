import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { updateSession } from "@/lib/supabase/proxy"

const productionOrigin = "https://jim-iskokit.vercel.app"
const allowedDevelopmentHosts = new Set(["localhost", "127.0.0.1", "::1"])

function isAllowedApiOrigin(request: NextRequest) {
  const host = request.nextUrl.hostname

  if (allowedDevelopmentHosts.has(host)) {
    return true
  }

  const expectedOrigin = new URL(productionOrigin)

  if (host !== expectedOrigin.hostname) {
    return false
  }

  const origin = request.headers.get("origin")

  if (origin) {
    return origin === expectedOrigin.origin
  }

  const referer = request.headers.get("referer")

  if (referer) {
    try {
      return new URL(referer).origin === expectedOrigin.origin
    } catch {
      return false
    }
  }

  return false
}

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    !isAllowedApiOrigin(request)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
