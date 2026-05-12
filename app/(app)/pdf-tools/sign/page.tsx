import { requireAuth } from "@/features/auth/server"
import { SignPdfPageClient } from "@/features/pdf-tools/components/sign-pdf-page-client"

export default async function SignPdfPage() {
  await requireAuth()

  return <SignPdfPageClient />
}
