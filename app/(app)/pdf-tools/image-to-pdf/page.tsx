import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { ImageToPdfPageClient } from "@/features/pdf-tools/components/image-to-pdf-page-client"

export const metadata: Metadata = {
  title: "Image to PDF",
}

export default async function ImageToPdfPage() {
  await requireAuth()

  return <ImageToPdfPageClient />
}
