import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { AnnotatorPageClient } from "@/features/pdf-tools/components/annotator-page-client"

export const metadata: Metadata = {
  title: "Annotate PDF",
}

export default async function AnnotatorPage() {
  await requireAuth()

  return <AnnotatorPageClient />
}
