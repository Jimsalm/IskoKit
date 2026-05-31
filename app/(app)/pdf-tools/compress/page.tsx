import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { CompressPdfPageClient } from "@/features/pdf-tools/components/compress-pdf-page-client"

export const metadata: Metadata = {
  title: "Compress PDF",
}

export default async function CompressPdfPage() {
  await requireAuth()

  return <CompressPdfPageClient />
}
