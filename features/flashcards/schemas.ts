import { z } from "zod"

import {
  flashcardDifficulties,
  flashcardGenerationSourceTypes,
  flashcardTypes,
  reviewRatings,
  reviewResults,
} from "@/features/flashcards/types"

export const minFlashcardSourceLength = 80
export const maxFlashcardSourceLength = 30000
export const maxGeneratedFlashcards = 20

export const flashcardDifficultyLabels = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const

export const flashcardTypeLabels = {
  qa: "Question & Answer",
  definition: "Definition",
  exam_prep: "Exam Prep",
  concept_check: "Concept Check",
} as const

export const flashcardSourceTypeLabels = {
  manual: "Manual card",
  manual_text: "Pasted text",
  note: "Saved note",
  summary: "Saved AI summary",
} as const

export const reviewRatingLabels = {
  easy: "Easy",
  good: "Good",
  hard: "Hard",
} as const

export const deckFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Deck title is required.")
    .max(120, "Keep the deck title under 120 characters."),
  description: z
    .string()
    .trim()
    .max(240, "Keep the description under 240 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(80, "Keep the subject under 80 characters."),
  color: z
    .string()
    .trim()
    .max(40, "Keep the color token short.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  icon: z
    .string()
    .trim()
    .max(40, "Keep the icon name short.")
    .optional()
    .transform((value) => (value ? value : undefined)),
})

export const manualFlashcardSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .max(300, "Keep the question under 300 characters."),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required.")
    .max(2000, "Keep the answer under 2,000 characters."),
  difficulty: z.enum(flashcardDifficulties).default("medium"),
})

export const updateFlashcardSchema = manualFlashcardSchema.extend({
  type: z.enum(flashcardTypes).default("qa"),
})

export const generatedFlashcardSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .max(300, "Keep each question under 300 characters."),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required.")
    .max(2000, "Keep each answer under 2,000 characters."),
  difficulty: z.enum(flashcardDifficulties),
  type: z.enum(flashcardTypes),
})

export const generatedFlashcardsResponseSchema = z.object({
  flashcards: z
    .array(generatedFlashcardSchema)
    .min(1, "The AI did not return any flashcards.")
    .max(maxGeneratedFlashcards, "The AI returned too many flashcards."),
})

export const generateFlashcardsRequestSchema = z
  .object({
    sourceType: z.enum(flashcardGenerationSourceTypes),
    sourceId: z
      .string()
      .trim()
      .uuid("Choose a saved source first.")
      .nullable()
      .optional(),
    content: z
      .string()
      .trim()
      .min(
        minFlashcardSourceLength,
        "Add at least 80 characters of study material.",
      )
      .max(
        maxFlashcardSourceLength,
        "Keep the source material under 30,000 characters.",
      ),
    cardType: z.enum(flashcardTypes),
    difficulty: z.enum(flashcardDifficulties),
    count: z.union([
      z.literal(5),
      z.literal(10),
      z.literal(15),
      z.literal(20),
    ]),
  })
  .superRefine((value, context) => {
    if (value.sourceType === "manual_text" && value.sourceId) {
      context.addIssue({
        code: "custom",
        path: ["sourceId"],
        message: "Pasted text should not have a saved source.",
      })
    }

    if (value.sourceType !== "manual_text" && !value.sourceId) {
      context.addIssue({
        code: "custom",
        path: ["sourceId"],
        message: "Choose a saved source first.",
      })
    }
  })

export const createGeneratedFlashcardsSchema = z
  .object({
    deckId: z.string().trim().uuid("Choose a deck first."),
    sourceType: z.enum(flashcardGenerationSourceTypes),
    sourceId: z
      .string()
      .trim()
      .uuid("Choose a saved source first.")
      .nullable()
      .optional(),
    flashcards: z
      .array(generatedFlashcardSchema)
      .min(1, "Save at least one flashcard.")
      .max(maxGeneratedFlashcards, "Save up to 20 flashcards at once."),
  })
  .superRefine((value, context) => {
    if (value.sourceType === "manual_text" && value.sourceId) {
      context.addIssue({
        code: "custom",
        path: ["sourceId"],
        message: "Pasted text should not have a saved source.",
      })
    }

    if (value.sourceType !== "manual_text" && !value.sourceId) {
      context.addIssue({
        code: "custom",
        path: ["sourceId"],
        message: "Choose a saved source first.",
      })
    }
  })

export const submitFlashcardReviewSchema = z.object({
  deckId: z.string().trim().uuid("Choose a deck first."),
  flashcardId: z.string().trim().uuid("Choose a flashcard first."),
  result: z.enum(reviewResults),
  rating: z.enum(reviewRatings).nullable().optional(),
})

export type DeckFormSchema = z.infer<typeof deckFormSchema>

export type ManualFlashcardSchema = z.infer<typeof manualFlashcardSchema>

export type UpdateFlashcardSchema = z.infer<typeof updateFlashcardSchema>

export type GenerateFlashcardsRequestSchema = z.infer<
  typeof generateFlashcardsRequestSchema
>

export type CreateGeneratedFlashcardsSchema = z.infer<
  typeof createGeneratedFlashcardsSchema
>

export type SubmitFlashcardReviewSchema = z.infer<
  typeof submitFlashcardReviewSchema
>
