import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { MergePdfPageClient } from "@/features/pdf-tools/components/merge-pdf-page-client"

export const metadata: Metadata = {
  title: "Merge PDF",
}

export default async function MergePdfPage() {
  await requireAuth()

  return <MergePdfPageClient />
}
