export const summaryInputTypes = ["pasted_text", "uploaded_file"] as const

export const summaryTypes = [
  "quick_summary",
  "key_points",
  "exam_reviewer",
] as const

export type SummaryInputType = (typeof summaryInputTypes)[number]

export type SummaryType = (typeof summaryTypes)[number]

export type Summary = {
  id: string
  userId: string
  fileId: string | null
  title: string
  inputType: SummaryInputType
  summaryType: SummaryType
  content: string
  sourceTextPreview: string | null
  createdAt: string
  updatedAt: string
}

export type SummaryRow = {
  id: string
  user_id: string
  file_id: string | null
  title: string
  input_type: SummaryInputType
  summary_type: SummaryType
  content: string
  source_text_preview: string | null
  created_at: string
  updated_at: string
}

export type GenerateSummaryValues = {
  inputType: SummaryInputType
  content: string
  summaryType: SummaryType
}

export type GenerateSummaryResult = {
  summary: string
}

export type ExtractedTextResult = {
  text: string
  preview: string
  fileName: string
  fileSize: number
}

export type CreateSummaryValues = {
  title: string
  inputType: SummaryInputType
  summaryType: SummaryType
  content: string
  sourceTextPreview?: string | null
  fileId?: string | null
}

export type SaveSummaryAsNoteValues = {
  summary: Summary | CreateSummaryValues
  subject?: string
  tags: string[]
}
