import { requireAuth } from "@/features/auth/server"
import { AnnotatorPageClient } from "@/features/pdf-tools/components/annotator-page-client"

export default async function AnnotatorPage() {
  await requireAuth()

  return <AnnotatorPageClient />
}
