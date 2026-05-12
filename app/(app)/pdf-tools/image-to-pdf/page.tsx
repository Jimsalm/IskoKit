import { requireAuth } from "@/features/auth/server"
import { ImageToPdfPageClient } from "@/features/pdf-tools/components/image-to-pdf-page-client"

export default async function ImageToPdfPage() {
  await requireAuth()

  return <ImageToPdfPageClient />
}
