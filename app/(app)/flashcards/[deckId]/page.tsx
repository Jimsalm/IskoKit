import { requireAuth } from "@/features/auth/server"
import { DeckDetailPageClient } from "@/features/flashcards/components/deck-detail-page-client"

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  await requireAuth()

  const { deckId } = await params

  return <DeckDetailPageClient deckId={deckId} />
}
