import type { LucideIcon } from "lucide-react"

export const noteSources = ["manual", "ai_summary", "imported"] as const

export type NoteSource = (typeof noteSources)[number]

export type Note = {
  id: string
  userId: string
  subject: string | null
  title: string
  content: string
  tags: string[]
  color: string | null
  isPinned: boolean
  source: NoteSource
  createdAt: string
  updatedAt: string
}

export type NoteRow = {
  id: string
  user_id: string
  subject: string | null
  title: string
  content: string
  tags: string[] | null
  color: string | null
  is_pinned: boolean
  source: NoteSource
  created_at: string
  updated_at: string
}

export type NoteFormValues = {
  title: string
  content: string
  subject?: string
  tags: string[]
  isPinned: boolean
  source?: NoteSource
}

export type NotesSort = "newest" | "oldest"

export type NotesFilterState = {
  search: string
  subject: string
  sort: NotesSort
}

export type NoteSourceMeta = {
  label: string
  icon?: LucideIcon
}
