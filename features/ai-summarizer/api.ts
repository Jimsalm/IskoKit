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
import { createClient } from "@/lib/supabase/client"

const summariesSelect =
  "id,user_id,file_id,title,input_type,summary_type,content,source_text_preview,created_at,updated_at"

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined

    return data?.error ?? error.message
  }

  return error instanceof Error ? error.message : "Something went wrong."
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
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error("You must be signed in to manage summaries.")
  }

  return data.user.id
}

export async function extractTextFromFile(file: File) {
  const formData = new FormData()
  formData.set("file", file)

  const { data } = await axios.post<ExtractedTextResult>(
    "/api/ai/extract-text",
    formData,
  )

  return data
}

export async function generateSummary(values: GenerateSummaryValues) {
  const { data } = await axios.post<GenerateSummaryResult>(
    "/api/ai/summarize",
    values,
  )

  return data
}

export async function listSummaries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("summaries")
    .select(summariesSelect)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
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
    throw new Error(error.message)
  }

  return toSummary(data as SummaryRow)
}

export async function deleteSummary(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("summaries").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
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
  return getErrorMessage(error)
}
