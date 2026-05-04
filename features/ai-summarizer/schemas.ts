import { z } from "zod"

import { summaryInputTypes, summaryTypes } from "@/features/ai-summarizer/types"

export const maxSummaryFileSizeBytes = 5 * 1024 * 1024
export const maxSourceTextLength = 30000
export const maxSummaryLength = 20000
export const sourceTextPreviewLength = 500

export const supportedSummaryFileExtensions = ["txt", "docx", "pdf"] as const

export const summaryTypeLabels = {
  quick_summary: "Quick Summary",
  key_points: "Key Points",
  exam_reviewer: "Exam Reviewer",
} as const

export const inputTypeLabels = {
  pasted_text: "Pasted text",
  uploaded_file: "Uploaded file",
} as const

export const summarizeRequestSchema = z.object({
  inputType: z.enum(summaryInputTypes),
  content: z
    .string()
    .trim()
    .min(1, "Add study material first.")
    .max(maxSourceTextLength, "Keep the source material under 30,000 characters."),
  summaryType: z.enum(summaryTypes),
})

export const createSummarySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Keep the title under 120 characters."),
  inputType: z.enum(summaryInputTypes),
  summaryType: z.enum(summaryTypes),
  content: z
    .string()
    .trim()
    .min(1, "Summary is required.")
    .max(maxSummaryLength, "Keep the summary under 20,000 characters."),
  sourceTextPreview: z
    .string()
    .trim()
    .max(sourceTextPreviewLength)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  fileId: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
})

export type SummarizeRequestSchema = z.infer<typeof summarizeRequestSchema>
export type CreateSummarySchema = z.infer<typeof createSummarySchema>
