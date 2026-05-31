import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { SignPdfPageClient } from "@/features/pdf-tools/components/sign-pdf-page-client"

export const metadata: Metadata = {
  title: "Sign PDF",
}

export default async function SignPdfPage() {
  await requireAuth()

  return <SignPdfPageClient />
}
