import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { SplitPdfPageClient } from "@/features/pdf-tools/components/split-pdf-page-client"

export const metadata: Metadata = {
  title: "Split PDF",
}

export default async function SplitPdfPage() {
  await requireAuth()

  return <SplitPdfPageClient />
}
