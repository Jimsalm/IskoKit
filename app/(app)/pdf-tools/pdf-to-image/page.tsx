import { requireAuth } from "@/features/auth/server"
import { PdfToImagePageClient } from "@/features/pdf-tools/components/pdf-to-image-page-client"

export default async function PdfToImagePage() {
  await requireAuth()

  return <PdfToImagePageClient />
}
