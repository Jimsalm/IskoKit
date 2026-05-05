import { requireAuth } from "@/features/auth/server"
import { CreateDeckPageClient } from "@/features/flashcards/components/create-deck-page-client"

export default async function NewFlashcardDeckPage() {
  await requireAuth()

  return <CreateDeckPageClient />
}
