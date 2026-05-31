import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { CreateDeckPageClient } from "@/features/flashcards/components/create-deck-page-client"

export const metadata: Metadata = {
  title: "Create Flashcard Deck",
}

export default async function NewFlashcardDeckPage() {
  await requireAuth()

  return <CreateDeckPageClient />
}
