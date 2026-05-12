"use client"

import { useMemo, useState } from "react"
import {
  NotebookTabsIcon,
  PinIcon,
  PlusIcon,
  SparklesIcon,
  TagsIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { noteMutationError } from "@/features/notes/api"
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from "@/features/notes/hooks"
import type { Note, NoteFormValues, NotesFilterState } from "@/features/notes/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NoteDeleteDialog } from "@/features/notes/components/note-delete-dialog"
import { NoteFormDialog } from "@/features/notes/components/note-form-dialog"
import { NoteGrid } from "@/features/notes/components/note-grid"
import {
  allSubjectsValue,
  NoteToolbar,
} from "@/features/notes/components/note-toolbar"
import { NotesError } from "@/features/notes/components/notes-error"
import { NotesLoading } from "@/features/notes/components/notes-loading"

const defaultFilters: NotesFilterState = {
  search: "",
  subject: allSubjectsValue,
  sort: "newest",
}

function getSearchTarget(note: Note) {
  return [note.title, note.content, note.subject ?? "", ...note.tags]
    .join(" ")
    .toLowerCase()
}

function sortNotes(notes: Note[], sort: NotesFilterState["sort"]) {
  return [...notes].sort((first, second) => {
    if (first.isPinned !== second.isPinned) {
      return first.isPinned ? -1 : 1
    }

    const firstTime = new Date(first.createdAt).getTime()
    const secondTime = new Date(second.createdAt).getTime()

    return sort === "newest" ? secondTime - firstTime : firstTime - secondTime
  })
}

function NotesStatCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <Card className="border border-border/70 bg-card/80 ring-0">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <CardAction>
          <span className="grid size-9 place-items-center rounded-md border border-border/70 bg-primary/10 text-primary">
            <Icon />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-4xl leading-none font-semibold tracking-normal">
          {value}
        </p>
      </CardContent>
      <CardFooter className="border-border/70 bg-transparent text-xs leading-5 text-muted-foreground">
        {helper}
      </CardFooter>
    </Card>
  )
}

export function NotesPageClient() {
  const [filters, setFilters] = useState<NotesFilterState>(defaultFilters)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)
  const notesQuery = useNotes()
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()
  const deleteMutation = useDeleteNote()
  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data])
  const isSaving = createMutation.isPending || updateMutation.isPending

  const subjects = useMemo(() => {
    return Array.from(
      new Set(notes.map((note) => note.subject).filter(Boolean) as string[]),
    ).sort((first, second) => first.localeCompare(second))
  }, [notes])

  const visibleNotes = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const filteredNotes = notes.filter((note) => {
      const matchesSearch = search ? getSearchTarget(note).includes(search) : true
      const matchesSubject =
        filters.subject === allSubjectsValue || note.subject === filters.subject

      return matchesSearch && matchesSubject
    })

    return sortNotes(filteredNotes, filters.sort)
  }, [filters, notes])

  const notesSummary = useMemo(
    () => ({
      total: notes.length,
      pinned: notes.filter((note) => note.isPinned).length,
      subjects: subjects.length,
      aiNotes: notes.filter((note) => note.source === "ai_summary").length,
    }),
    [notes, subjects.length],
  )

  function openCreateDialog() {
    setEditingNote(null)
    setIsFormOpen(true)
  }

  function openEditDialog(note: Note) {
    setEditingNote(note)
    setIsFormOpen(true)
  }

  async function handleSubmit(values: NoteFormValues) {
    try {
      if (editingNote) {
        await updateMutation.mutateAsync({
          id: editingNote.id,
          values,
        })
        toast.success("Note updated.")
      } else {
        await createMutation.mutateAsync(values)
        toast.success("Note created.")
      }

      setIsFormOpen(false)
      setEditingNote(null)
    } catch (error) {
      toast.error(noteMutationError(error))
    }
  }

  async function handleDelete() {
    if (!deletingNote) {
      return
    }

    try {
      await deleteMutation.mutateAsync(deletingNote.id)
      toast.success("Note deleted.")
      setDeletingNote(null)
    } catch (error) {
      toast.error(noteMutationError(error))
    }
  }

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-normal">Notes</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Create, pin, tag, and organize study notes in one focused workspace.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <PlusIcon data-icon="inline-start" />
          New note
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <NotesStatCard
          helper="All saved study notes"
          icon={NotebookTabsIcon}
          label="Total notes"
          value={notesSummary.total}
        />
        <NotesStatCard
          helper="Pinned notes stay first"
          icon={PinIcon}
          label="Pinned"
          value={notesSummary.pinned}
        />
        <NotesStatCard
          helper="Available subject filters"
          icon={TagsIcon}
          label="Subjects"
          value={notesSummary.subjects}
        />
        <NotesStatCard
          helper="Saved from AI summaries"
          icon={SparklesIcon}
          label="AI notes"
          value={notesSummary.aiNotes}
        />
      </div>

      <NoteToolbar
        search={filters.search}
        subject={filters.subject}
        subjects={subjects}
        sort={filters.sort}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        onSubjectChange={(subject) =>
          setFilters((current) => ({ ...current, subject }))
        }
        onSortChange={(sort) => setFilters((current) => ({ ...current, sort }))}
      />

      {notesQuery.isPending ? <NotesLoading /> : null}
      {notesQuery.isError ? (
        <NotesError
          message={noteMutationError(notesQuery.error)}
          onRetry={() => void notesQuery.refetch()}
        />
      ) : null}
      {notesQuery.isSuccess ? (
        <NoteGrid
          notes={visibleNotes}
          hasNotes={notes.length > 0}
          onCreate={openCreateDialog}
          onEdit={openEditDialog}
          onDelete={setDeletingNote}
        />
      ) : null}

      <NoteFormDialog
        open={isFormOpen}
        note={editingNote}
        isSubmitting={isSaving}
        onOpenChange={(open) => {
          setIsFormOpen(open)

          if (!open) {
            setEditingNote(null)
          }
        }}
        onSubmit={handleSubmit}
      />

      <NoteDeleteDialog
        note={deletingNote}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingNote(null)
          }
        }}
        onConfirm={handleDelete}
      />
    </section>
  )
}
