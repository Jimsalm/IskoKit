import { requireAuth } from "@/features/auth/server"
import { FlashcardsPageClient } from "@/features/flashcards/components/flashcards-page-client"

export default async function FlashcardsPage() {
  await requireAuth()

  return <FlashcardsPageClient />
}
