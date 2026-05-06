import type {
  Flashcard,
  ReviewRating,
  ReviewResult,
} from "@/features/flashcards/types"

const tenMinutes = 10 * 60 * 1000
const oneDay = 24 * 60 * 60 * 1000

function addMilliseconds(date: Date, milliseconds: number) {
  return new Date(date.getTime() + milliseconds)
}

function clampDifficultyLevel(value: number) {
  return Math.min(Math.max(value, 0), 10)
}

export function isFlashcardDue(flashcard: Pick<Flashcard, "nextReviewAt">) {
  return (
    !flashcard.nextReviewAt ||
    new Date(flashcard.nextReviewAt).getTime() <= Date.now()
  )
}

export function isFlashcardMastered(
  flashcard: Pick<Flashcard, "correctCount" | "incorrectCount">,
) {
  return flashcard.correctCount >= 3 && flashcard.incorrectCount <= 1
}

export function calculateNextReview({
  flashcard,
  result,
  rating,
  reviewedAt = new Date(),
}: {
  flashcard: Flashcard
  result: ReviewResult
  rating?: ReviewRating | null
  reviewedAt?: Date
}) {
  const isCorrect = result === "correct"
  const nextCorrectCount = flashcard.correctCount + (isCorrect ? 1 : 0)
  const nextIncorrectCount = flashcard.incorrectCount + (isCorrect ? 0 : 1)
  let nextReviewAt: Date
  let difficultyLevel = flashcard.difficultyLevel

  if (!isCorrect) {
    nextReviewAt = addMilliseconds(reviewedAt, tenMinutes)
    difficultyLevel += 1
  } else if (rating === "easy") {
    nextReviewAt = addMilliseconds(reviewedAt, 14 * oneDay)
    difficultyLevel -= 1
  } else if (rating === "hard") {
    nextReviewAt = addMilliseconds(reviewedAt, oneDay)
    difficultyLevel += 1
  } else if (flashcard.correctCount === 0) {
    nextReviewAt = addMilliseconds(reviewedAt, oneDay)
  } else if (flashcard.correctCount === 1) {
    nextReviewAt = addMilliseconds(reviewedAt, 3 * oneDay)
  } else {
    nextReviewAt = addMilliseconds(reviewedAt, 7 * oneDay)
  }

  return {
    reviewCount: flashcard.reviewCount + 1,
    correctCount: nextCorrectCount,
    incorrectCount: nextIncorrectCount,
    difficultyLevel: clampDifficultyLevel(difficultyLevel),
    lastReviewedAt: reviewedAt.toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
  }
}
