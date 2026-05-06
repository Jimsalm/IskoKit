import axios from "axios"

import { createNote } from "@/features/notes/api"
import {
  createSummarySchema,
  inputTypeLabels,
  summaryTypeLabels,
} from "@/features/ai-summarizer/schemas"
import type {
  CreateSummaryValues,
  ExtractedTextResult,
  GenerateSummaryResult,
  GenerateSummaryValues,
  SaveSummaryAsNoteValues,
  Summary,
  SummaryRow,
} from "@/features/ai-summarizer/types"
import { summaryInputTypes, summaryTypes } from "@/features/ai-summarizer/types"
import { AppError, getUserErrorMessage, throwAppError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/client"

const summariesSelect =
  "id,user_id,file_id,title,input_type,summary_type,content,source_text_preview,created_at,updated_at"

const summaryErrorMessages = {
  permissionMessage:
    "You do not have permission to manage summaries. Please sign in again.",
  setupMessage:
    "Summaries are not set up yet. Please run the summaries database migration.",
  networkMessage:
    "Could not reach the database. Check your connection and try again.",
}

function summaryErrorOptions(fallbackMessage: string) {
  return {
    ...summaryErrorMessages,
    fallbackMessage,
  }
}

function summarizerRequestErrorOptions(fallbackMessage: string) {
  return {
    fallbackMessage,
    permissionMessage:
      "You must be signed in to use the AI Summarizer. Please sign in again.",
    setupMessage: "AI Summarizer is not configured yet.",
    networkMessage:
      "Could not reach the AI Summarizer. Check your connection and try again.",
    preferResponseMessage: true,
  }
}

function toSummary(row: SummaryRow): Summary {
  const inputType = summaryInputTypes.includes(row.input_type)
    ? row.input_type
    : "pasted_text"
  const summaryType = summaryTypes.includes(row.summary_type)
    ? row.summary_type
    : "quick_summary"

  return {
    id: row.id,
    userId: row.user_id,
    fileId: row.file_id,
    title: row.title,
    inputType,
    summaryType,
    content: row.content,
    sourceTextPreview: row.source_text_preview,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toSummaryPayload(values: CreateSummaryValues) {
  const parsed = createSummarySchema.parse(values)

  return {
    title: parsed.title,
    input_type: parsed.inputType,
    summary_type: parsed.summaryType,
    content: parsed.content,
    source_text_preview: parsed.sourceTextPreview,
    file_id: parsed.fileId,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throwAppError(
      error,
      summaryErrorOptions("Could not verify your session. Please sign in again."),
    )
  }

  if (!data.user) {
    throw new AppError("You must be signed in to manage summaries.", {
      code: "AUTH_REQUIRED",
    })
  }

  return data.user.id
}

export async function extractTextFromFile(file: File) {
  const formData = new FormData()
  formData.set("file", file)

  try {
    const { data } = await axios.post<ExtractedTextResult>(
      "/api/ai/extract-text",
      formData,
    )

    return data
  } catch (error) {
    throwAppError(
      error,
      summarizerRequestErrorOptions(
        "Could not prepare material. Please try again.",
      ),
    )
  }
}

export async function generateSummary(values: GenerateSummaryValues) {
  try {
    const { data } = await axios.post<GenerateSummaryResult>(
      "/api/ai/summarize",
      values,
    )

    return data
  } catch (error) {
    throwAppError(
      error,
      summarizerRequestErrorOptions(
        "Could not generate summary. Please try again.",
      ),
    )
  }
}

export async function listSummaries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("summaries")
    .select(summariesSelect)
    .order("created_at", { ascending: false })

  if (error) {
    throwAppError(
      error,
      summaryErrorOptions("Could not load summaries. Please try again."),
    )
  }

  return ((data ?? []) as SummaryRow[]).map(toSummary)
}

export async function createSummary(values: CreateSummaryValues) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const payload = toSummaryPayload(values)

  const { data, error } = await supabase
    .from("summaries")
    .insert({
      ...payload,
      user_id: userId,
    })
    .select(summariesSelect)
    .single()

  if (error) {
    throwAppError(
      error,
      summaryErrorOptions("Could not save summary. Please try again."),
    )
  }

  return toSummary(data as SummaryRow)
}

export async function deleteSummary(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("summaries").delete().eq("id", id)

  if (error) {
    throwAppError(
      error,
      summaryErrorOptions("Could not delete summary. Please try again."),
    )
  }
}

export async function saveSummaryAsNote({
  summary,
  subject,
  tags,
}: SaveSummaryAsNoteValues) {
  return createNote({
    title: summary.title,
    content: summary.content,
    subject,
    tags,
    isPinned: false,
    source: "ai_summary",
  })
}

export function getSummaryTypeLabel(value: Summary["summaryType"]) {
  return summaryTypeLabels[value]
}

export function getInputTypeLabel(value: Summary["inputType"]) {
  return inputTypeLabels[value]
}

export function summaryMutationError(error: unknown) {
  return getUserErrorMessage(
    error,
    "Something went wrong with summaries. Please try again.",
  )
}
