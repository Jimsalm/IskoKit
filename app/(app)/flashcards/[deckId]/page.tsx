import type { Metadata } from "next"

import { requireAuth } from "@/features/auth/server"
import { DeckDetailPageClient } from "@/features/flashcards/components/deck-detail-page-client"

export const metadata: Metadata = {
  title: "Flashcard Deck",
}

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  await requireAuth()

  const { deckId } = await params

  return <DeckDetailPageClient deckId={deckId} />
}
