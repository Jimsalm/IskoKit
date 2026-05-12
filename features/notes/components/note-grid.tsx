"use client"

import type { Note } from "@/features/notes/types"
import { Badge } from "@/components/ui/badge"
import { NoteCard } from "@/features/notes/components/note-card"
import { NotesEmpty } from "@/features/notes/components/notes-empty"

function NoteSection({
  description,
  title,
  notes,
  onEdit,
  onDelete,
}: {
  description: string
  title: string
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-base font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </Badge>
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
          description="Saved for quick access and shown before the rest."
          title="Pinned"
          notes={pinnedNotes}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {otherNotes.length ? (
          <NoteSection
            description="All remaining notes sorted by your current view."
            title="Other Notes"
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
