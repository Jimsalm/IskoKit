import { requireAuth } from "@/features/auth/server"
import { ReviewPageClient } from "@/features/flashcards/components/review-page-client"
import type { ReviewScope } from "@/features/flashcards/types"

export default async function FlashcardReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ deckId: string }>
  searchParams: Promise<{ scope?: string }>
}) {
  await requireAuth()

  const { deckId } = await params
  const { scope } = await searchParams
  const reviewScope: ReviewScope = scope === "all" ? "all" : "due"

  return <ReviewPageClient deckId={deckId} scope={reviewScope} />
}
