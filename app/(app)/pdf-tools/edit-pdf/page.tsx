import { requireAuth } from "@/features/auth/server"
import { EditPdfPageClient } from "@/features/pdf-tools/components/edit-pdf-page-client"

export default async function EditPdfPage() {
  await requireAuth()

  return <EditPdfPageClient />
}
