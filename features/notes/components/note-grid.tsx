"use client"

import type { Note } from "@/features/notes/types"
import { NoteCard } from "@/features/notes/components/note-card"
import { NotesEmpty } from "@/features/notes/components/notes-empty"

function NoteSection({
  title,
  notes,
  onEdit,
  onDelete,
}: {
  title: string
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  )
}

export function NoteGrid({
  notes,
  hasNotes,
  onCreate,
  onEdit,
  onDelete,
}: {
  notes: Note[]
  hasNotes: boolean
  onCreate: () => void
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}) {
  if (!notes.length) {
    return <NotesEmpty hasNotes={hasNotes} onCreate={onCreate} />
  }

  const pinnedNotes = notes.filter((note) => note.isPinned)
  const otherNotes = notes.filter((note) => !note.isPinned)

  if (pinnedNotes.length) {
    return (
      <div className="flex flex-col gap-6">
        <NoteSection
          title="Pinned"
          notes={pinnedNotes}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {otherNotes.length ? (
          <NoteSection
            title="Other notes"
            notes={otherNotes}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
