export const flashcardDifficulties = ["easy", "medium", "hard"] as const

export const flashcardTypes = [
  "qa",
  "definition",
  "exam_prep",
  "concept_check",
] as const

export const flashcardSourceTypes = [
  "manual",
  "manual_text",
  "note",
  "summary",
] as const

export const flashcardGenerationSourceTypes = [
  "manual_text",
  "note",
  "summary",
] as const

export const flashcardCounts = [5, 10, 15, 20] as const

export const reviewResults = ["correct", "incorrect"] as const

export const reviewRatings = ["easy", "good", "hard"] as const

export type FlashcardDifficulty = (typeof flashcardDifficulties)[number]

export type FlashcardType = (typeof flashcardTypes)[number]

export type FlashcardSourceType = (typeof flashcardSourceTypes)[number]

export type FlashcardGenerationSourceType =
  (typeof flashcardGenerationSourceTypes)[number]

export type FlashcardCount = (typeof flashcardCounts)[number]

export type ReviewResult = (typeof reviewResults)[number]

export type ReviewRating = (typeof reviewRatings)[number]

export type ReviewScope = "due" | "all"

export type FlashcardDeckStats = {
  totalCards: number
  dueCards: number
  masteredCards: number
  accuracyPercentage: number
}

export type FlashcardDeck = {
  id: string
  userId: string
  title: string
  description: string | null
  subject: string
  color: string | null
  icon: string | null
  createdAt: string
  updatedAt: string
}

export type FlashcardDeckWithStats = FlashcardDeck & {
  stats: FlashcardDeckStats
}

export type FlashcardDeckRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  subject: string
  color: string | null
  icon: string | null
  created_at: string
  updated_at: string
}

export type Flashcard = {
  id: string
  userId: string
  deckId: string
  subject: string | null
  question: string
  answer: string
  difficulty: FlashcardDifficulty
  type: FlashcardType
  sourceType: FlashcardSourceType
  sourceId: string | null
  isAiGenerated: boolean
  reviewCount: number
  correctCount: number
  incorrectCount: number
  difficultyLevel: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
  createdAt: string
  updatedAt: string
}

export type FlashcardRow = {
  id: string
  user_id: string
  deck_id: string | null
  subject: string | null
  question: string
  answer: string
  difficulty: FlashcardDifficulty
  type: FlashcardType
  source_type: FlashcardSourceType
  source_id: string | null
  is_ai_generated: boolean
  review_count: number | null
  correct_count: number | null
  incorrect_count: number | null
  difficulty_level: number | null
  last_reviewed_at: string | null
  next_review_at: string | null
  created_at: string
  updated_at: string
}

export type FlashcardStatsRow = {
  deck_id: string | null
  correct_count: number | null
  incorrect_count: number | null
  next_review_at: string | null
}

export type FlashcardReview = {
  id: string
  userId: string
  flashcardId: string
  deckId: string
  result: ReviewResult
  rating: ReviewRating | null
  reviewedAt: string
}

export type FlashcardReviewRow = {
  id: string
  user_id: string
  flashcard_id: string
  deck_id: string
  result: ReviewResult
  rating: ReviewRating | null
  reviewed_at: string
}

export type GeneratedFlashcard = {
  question: string
  answer: string
  difficulty: FlashcardDifficulty
  type: FlashcardType
}

export type FlashcardPreview = GeneratedFlashcard & {
  previewId: string
}

export type DeckFormValues = {
  title: string
  description?: string
  subject: string
  color?: string
  icon?: string
}

export type ManualFlashcardValues = {
  question: string
  answer: string
  difficulty: FlashcardDifficulty
}

export type UpdateFlashcardValues = ManualFlashcardValues & {
  type: FlashcardType
}

export type GenerateFlashcardsValues = {
  sourceType: FlashcardGenerationSourceType
  sourceId?: string | null
  content: string
  cardType: FlashcardType
  difficulty: FlashcardDifficulty
  count: FlashcardCount
}

export type GenerateFlashcardsResult = {
  flashcards: GeneratedFlashcard[]
}

export type CreateGeneratedFlashcardsValues = {
  deckId: string
  sourceType: FlashcardGenerationSourceType
  sourceId?: string | null
  flashcards: GeneratedFlashcard[]
}

export type SubmitFlashcardReviewValues = {
  deckId: string
  flashcardId: string
  result: ReviewResult
  rating?: ReviewRating | null
}

export type FlashcardFilters = {
  subject: string
  difficulty: string
  type: string
}

export type FlashcardViewMode = "grid" | "review"
