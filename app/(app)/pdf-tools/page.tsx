import { requireAuth } from "@/features/auth/server"
import { PdfToolsHomePageClient } from "@/features/pdf-tools/components/pdf-tools-home-page-client"

export default async function PdfToolsPage() {
  await requireAuth()

  return <PdfToolsHomePageClient />
}
