import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { PdfToolsHomePageClient } from "@/features/pdf-tools/components/pdf-tools-home-page-client"

export const metadata: Metadata = {
  title: "PDF Tools",
}

export default async function PdfToolsPage() {
  await requireAuth()

  return <PdfToolsHomePageClient />
}
