import { requireAuth } from "@/features/auth/server"
import { MergePdfPageClient } from "@/features/pdf-tools/components/merge-pdf-page-client"

export default async function MergePdfPage() {
  await requireAuth()

  return <MergePdfPageClient />
}
