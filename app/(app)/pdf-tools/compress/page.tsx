import { requireAuth } from "@/features/auth/server"
import { CompressPdfPageClient } from "@/features/pdf-tools/components/compress-pdf-page-client"

export default async function CompressPdfPage() {
  await requireAuth()

  return <CompressPdfPageClient />
}
