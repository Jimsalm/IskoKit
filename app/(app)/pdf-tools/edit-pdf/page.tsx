import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { EditPdfPageClient } from "@/features/pdf-tools/components/edit-pdf-page-client"

export const metadata: Metadata = {
  title: "Edit PDF",
}

export default async function EditPdfPage() {
  await requireAuth()

  return <EditPdfPageClient />
}
