import { noteFormSchema } from "@/features/notes/schemas"
import type { Note, NoteFormValues, NoteRow } from "@/features/notes/types"
import { noteSources } from "@/features/notes/types"
import { createClient } from "@/lib/supabase/client"

const notesSelect =
  "id,user_id,subject,title,content,tags,color,is_pinned,source,created_at,updated_at"

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong."
}

function toNote(row: NoteRow): Note {
  const source = noteSources.includes(row.source) ? row.source : "manual"

  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    color: row.color,
    isPinned: row.is_pinned,
    source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toNotePayload(values: NoteFormValues) {
  const parsed = noteFormSchema.parse(values)

  return {
    title: parsed.title,
    content: parsed.content,
    subject: parsed.subject ?? null,
    tags: parsed.tags,
    is_pinned: parsed.isPinned,
    source: parsed.source,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error("You must be signed in to manage notes.")
  }

  return data.user.id
}

export async function listNotes(): Promise<Note[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notes")
    .select(notesSelect)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as NoteRow[]).map(toNote)
}

export async function createNote(values: NoteFormValues): Promise<Note> {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const payload = toNotePayload(values)

  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...payload,
      color: null,
      user_id: userId,
    })
    .select(notesSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toNote(data as NoteRow)
}

export async function updateNote({
  id,
  values,
}: {
  id: string
  values: NoteFormValues
}): Promise<Note> {
  const supabase = createClient()
  const payload = toNotePayload(values)

  const { data, error } = await supabase
    .from("notes")
    .update(payload)
    .eq("id", id)
    .select(notesSelect)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toNote(data as NoteRow)
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("notes").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export function noteMutationError(error: unknown) {
  return getErrorMessage(error)
}
