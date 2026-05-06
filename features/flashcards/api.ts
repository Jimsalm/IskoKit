import axios from "axios"

import { calculateNextReview, isFlashcardDue, isFlashcardMastered } from "@/features/flashcards/lib/review"
import {
  createGeneratedFlashcardsSchema,
  deckFormSchema,
  flashcardDifficultyLabels,
  flashcardSourceTypeLabels,
  flashcardTypeLabels,
  generateFlashcardsRequestSchema,
  manualFlashcardSchema,
  reviewRatingLabels,
  submitFlashcardReviewSchema,
  updateFlashcardSchema,
} from "@/features/flashcards/schemas"
import type {
  CreateGeneratedFlashcardsValues,
  DeckFormValues,
  Flashcard,
  FlashcardDeck,
  FlashcardDeckRow,
  FlashcardDeckStats,
  FlashcardDeckWithStats,
  FlashcardDifficulty,
  FlashcardGenerationSourceType,
  FlashcardReviewRow,
  FlashcardRow,
  FlashcardSourceType,
  FlashcardStatsRow,
  FlashcardType,
  GenerateFlashcardsResult,
  GenerateFlashcardsValues,
  ManualFlashcardValues,
  ReviewRating,
  SubmitFlashcardReviewValues,
  UpdateFlashcardValues,
} from "@/features/flashcards/types"
import {
  flashcardDifficulties,
  flashcardSourceTypes,
  flashcardTypes,
  reviewRatings,
  reviewResults,
} from "@/features/flashcards/types"
import { createClient } from "@/lib/supabase/client"

const deckSelect =
  "id,user_id,title,description,subject,color,icon,created_at,updated_at"

const flashcardsSelect =
  "id,user_id,deck_id,subject,question,answer,difficulty,type,source_type,source_id,is_ai_generated,review_count,correct_count,incorrect_count,difficulty_level,last_reviewed_at,next_review_at,created_at,updated_at"

const flashcardStatsSelect =
  "deck_id,correct_count,incorrect_count,next_review_at"

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined

    return data?.error ?? error.message
  }

  return error instanceof Error ? error.message : "Something went wrong."
}

function toDeck(row: FlashcardDeckRow): FlashcardDeck {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    color: row.color,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toFlashcard(row: FlashcardRow): Flashcard {
  const difficulty = flashcardDifficulties.includes(row.difficulty)
    ? row.difficulty
    : "medium"
  const type = flashcardTypes.includes(row.type) ? row.type : "qa"
  const sourceType = flashcardSourceTypes.includes(row.source_type)
    ? row.source_type
    : "manual_text"

  return {
    id: row.id,
    userId: row.user_id,
    deckId: row.deck_id ?? "",
    subject: row.subject,
    question: row.question,
    answer: row.answer,
    difficulty,
    type,
    sourceType,
    sourceId: row.source_id,
    isAiGenerated: row.is_ai_generated,
    reviewCount: row.review_count ?? 0,
    correctCount: row.correct_count ?? 0,
    incorrectCount: row.incorrect_count ?? 0,
    difficultyLevel: row.difficulty_level ?? 0,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewAt: row.next_review_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

type FlashcardStatsItem = Pick<
  Flashcard,
  "deckId" | "correctCount" | "incorrectCount" | "nextReviewAt"
>

function toFlashcardStatsItem(row: FlashcardStatsRow): FlashcardStatsItem {
  return {
    deckId: row.deck_id ?? "",
    correctCount: row.correct_count ?? 0,
    incorrectCount: row.incorrect_count ?? 0,
    nextReviewAt: row.next_review_at,
  }
}

function getDeckStats(flashcards: FlashcardStatsItem[]): FlashcardDeckStats {
  const correctReviews = flashcards.reduce(
    (total, flashcard) => total + flashcard.correctCount,
    0,
  )
  const incorrectReviews = flashcards.reduce(
    (total, flashcard) => total + flashcard.incorrectCount,
    0,
  )
  const reviewTotal = correctReviews + incorrectReviews

  return {
    totalCards: flashcards.length,
    dueCards: flashcards.filter(isFlashcardDue).length,
    masteredCards: flashcards.filter(isFlashcardMastered).length,
    accuracyPercentage: reviewTotal
      ? Math.round((correctReviews / reviewTotal) * 100)
      : 0,
  }
}

function toDeckPayload(values: DeckFormValues) {
  const parsed = deckFormSchema.parse(values)

  return {
    title: parsed.title,
    description: parsed.description ?? null,
    subject: parsed.subject,
    color: parsed.color ?? null,
    icon: parsed.icon ?? null,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error("You must be signed in to manage flashcards.")
  }

  return data.user.id
}

export async function generateFlashcards(values: GenerateFlashcardsValues) {
  const payload = generateFlashcardsRequestSchema.parse(values)
  const { data } = await axios.post<GenerateFlashcardsResult>(
    "/api/ai/flashcards",
    payload,
  )

  return data
}

export async function listDecksWithStats(): Promise<FlashcardDeckWithStats[]> {
  const supabase = createClient()
  const [decksResult, flashcardsResult] = await Promise.all([
    supabase
      .from("flashcard_decks")
      .select(deckSelect)
      .order("updated_at", { ascending: false }),
    supabase
      .from("flashcards")
      .select(flashcardStatsSelect)
      .not("deck_id", "is", null),
  ])

  if (decksResult.error) {
    throw new Error(decksResult.error.message)
  }

  if (flashcardsResult.error) {
    throw new Error(flashcardsResult.error.message)
  }

  const flashcards = ((flashcardsResult.data ?? []) as FlashcardStatsRow[])
    .map(toFlashcardStatsItem)
    .filter((flashcard) => flashcard.deckId)

  return ((decksResult.data ?? []) as FlashcardDeckRow[]).map((row) => {
    const deck = toDeck(row)

    return {
      ...deck,
      stats: getDeckStats(
        flashcards.filter((flashcard) => flashcard.deckId === deck.id),
      ),
    }
  })
}

export async function getDeck(id: string): Promise<FlashcardDeck> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("flashcard_decks")
    .select(deckSelect)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toDeck(data as FlashcardDeckRow)
}

export async function createDeck(values: DeckFormValues) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const payload = toDeckPayload(values)
  const { data, error } = await supabase
    .from("flashcard_decks")
    .insert({
      ...payload,
      user_id: userId,
    })
    .select(deckSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toDeck(data as FlashcardDeckRow)
}

export async function updateDeck({
  id,
  values,
}: {
  id: string
  values: DeckFormValues
}) {
  const supabase = createClient()
  const payload = toDeckPayload(values)
  const { data, error } = await supabase
    .from("flashcard_decks")
    .update(payload)
    .eq("id", id)
    .select(deckSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toDeck(data as FlashcardDeckRow)
}

export async function deleteDeck(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("flashcard_decks").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function listFlashcardsByDeck(deckId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("flashcards")
    .select(flashcardsSelect)
    .eq("deck_id", deckId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as FlashcardRow[])
    .map(toFlashcard)
    .filter((flashcard) => flashcard.deckId)
}

export async function createManualFlashcard({
  deckId,
  values,
}: {
  deckId: string
  values: ManualFlashcardValues
}) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const parsed = manualFlashcardSchema.parse(values)
  const { data, error } = await supabase
    .from("flashcards")
    .insert({
      user_id: userId,
      deck_id: deckId,
      subject: null,
      question: parsed.question,
      answer: parsed.answer,
      difficulty: parsed.difficulty,
      type: "qa",
      source_type: "manual",
      source_id: null,
      is_ai_generated: false,
    })
    .select(flashcardsSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toFlashcard(data as FlashcardRow)
}

export async function updateFlashcard({
  id,
  values,
}: {
  id: string
  values: UpdateFlashcardValues
}) {
  const supabase = createClient()
  const parsed = updateFlashcardSchema.parse(values)
  const { data, error } = await supabase
    .from("flashcards")
    .update({
      question: parsed.question,
      answer: parsed.answer,
      difficulty: parsed.difficulty,
      type: parsed.type,
    })
    .eq("id", id)
    .select(flashcardsSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toFlashcard(data as FlashcardRow)
}

export async function createGeneratedFlashcards(
  values: CreateGeneratedFlashcardsValues,
) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const parsed = createGeneratedFlashcardsSchema.parse(values)
  const rows = parsed.flashcards.map((flashcard) => ({
    user_id: userId,
    deck_id: parsed.deckId,
    subject: null,
    question: flashcard.question,
    answer: flashcard.answer,
    difficulty: flashcard.difficulty,
    type: flashcard.type,
    source_type: parsed.sourceType,
    source_id: parsed.sourceId ?? null,
    is_ai_generated: true,
  }))
  const { data, error } = await supabase
    .from("flashcards")
    .insert(rows)
    .select(flashcardsSelect)

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as FlashcardRow[]).map(toFlashcard)
}

export async function deleteFlashcard(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("flashcards").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function submitFlashcardReview(
  values: SubmitFlashcardReviewValues,
) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const parsed = submitFlashcardReviewSchema.parse(values)
  const { data: cardData, error: cardError } = await supabase
    .from("flashcards")
    .select(flashcardsSelect)
    .eq("id", parsed.flashcardId)
    .eq("deck_id", parsed.deckId)
    .single()

  if (cardError) {
    throw new Error(cardError.message)
  }

  const flashcard = toFlashcard(cardData as FlashcardRow)
  const reviewedAt = new Date()
  const nextReview = calculateNextReview({
    flashcard,
    result: parsed.result,
    rating: parsed.rating,
    reviewedAt,
  })
  const { data: updatedData, error: updateError } = await supabase
    .from("flashcards")
    .update({
      review_count: nextReview.reviewCount,
      correct_count: nextReview.correctCount,
      incorrect_count: nextReview.incorrectCount,
      difficulty_level: nextReview.difficultyLevel,
      last_reviewed_at: nextReview.lastReviewedAt,
      next_review_at: nextReview.nextReviewAt,
    })
    .eq("id", parsed.flashcardId)
    .select(flashcardsSelect)
    .single()

  if (updateError) {
    throw new Error(updateError.message)
  }

  const { error: reviewError } = await supabase
    .from("flashcard_reviews")
    .insert({
      user_id: userId,
      flashcard_id: parsed.flashcardId,
      deck_id: parsed.deckId,
      result: parsed.result,
      rating: parsed.rating ?? null,
      reviewed_at: reviewedAt.toISOString(),
    } satisfies Omit<FlashcardReviewRow, "id">)

  if (reviewError) {
    throw new Error(reviewError.message)
  }

  return toFlashcard(updatedData as FlashcardRow)
}

export function getDeckStatsForFlashcards(flashcards: Flashcard[]) {
  return getDeckStats(flashcards)
}

export function getFlashcardDifficultyLabel(value: FlashcardDifficulty) {
  return flashcardDifficultyLabels[value]
}

export function getFlashcardTypeLabel(value: FlashcardType) {
  return flashcardTypeLabels[value]
}

export function getFlashcardSourceTypeLabel(value: FlashcardSourceType) {
  return flashcardSourceTypeLabels[value]
}

export function getGenerationSourceTypeLabel(
  value: FlashcardGenerationSourceType,
) {
  return flashcardSourceTypeLabels[value]
}

export function getReviewRatingLabel(value: ReviewRating) {
  return reviewRatingLabels[value]
}

export function isReviewResult(value: string) {
  return reviewResults.includes(value as SubmitFlashcardReviewValues["result"])
}

export function isReviewRating(value: string) {
  return reviewRatings.includes(value as ReviewRating)
}

export function flashcardMutationError(error: unknown) {
  return getErrorMessage(error)
}
