"use client"

import { FormEvent, useMemo, useState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import { noteFormSchema, parseTagsText } from "@/features/notes/schemas"
import type { Note, NoteFormValues } from "@/features/notes/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type NoteFormErrors = {
  title?: string
  content?: string
  subject?: string
  tags?: string
}

const emptyFormState = {
  title: "",
  content: "",
  subject: "",
  tagsText: "",
  isPinned: false,
}

function getInitialFormState(note?: Note | null) {
  if (!note) {
    return emptyFormState
  }

  return {
    title: note.title,
    content: note.content,
    subject: note.subject ?? "",
    tagsText: note.tags.join(", "),
    isPinned: note.isPinned,
  }
}

export function NoteFormDialog({
  open,
  note,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  note: Note | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: NoteFormValues) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <NoteFormDialogContent
          key={note?.id ?? "new"}
          note={note}
          isSubmitting={isSubmitting}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function NoteFormDialogContent({
  note,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  note: Note | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: NoteFormValues) => Promise<void>
}) {
  const [formState, setFormState] = useState(() => getInitialFormState(note))
  const [errors, setErrors] = useState<NoteFormErrors>({})
  const title = note ? "Edit note" : "New note"
  const description = note
    ? "Update your study note details."
    : "Capture a study note with an optional subject and tags."

  const parsedTags = useMemo(
    () => parseTagsText(formState.tagsText),
    [formState.tagsText],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = noteFormSchema.safeParse({
      title: formState.title,
      content: formState.content,
      subject: formState.subject,
      tags: parsedTags,
      isPinned: formState.isPinned,
      source: note?.source ?? "manual",
    })

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors

      setErrors({
        title: fieldErrors.title?.[0],
        content: fieldErrors.content?.[0],
        subject: fieldErrors.subject?.[0],
        tags: fieldErrors.tags?.[0],
      })
      return
    }

    setErrors({})
    await onSubmit(parsed.data)
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldGroup className="gap-4">
          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor="note-title">Title</FieldLabel>
            <Input
              id="note-title"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.title)}
            />
            <FieldError>{errors.title}</FieldError>
          </Field>

          <Field data-invalid={Boolean(errors.content)}>
            <FieldLabel htmlFor="note-content">Content</FieldLabel>
            <Textarea
              id="note-content"
              value={formState.content}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              className="min-h-48 resize-y"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.content)}
            />
            <FieldError>{errors.content}</FieldError>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.subject)}>
              <FieldLabel htmlFor="note-subject">Subject</FieldLabel>
              <Input
                id="note-subject"
                value={formState.subject}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="Optional"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.subject)}
              />
              <FieldError>{errors.subject}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.tags)}>
              <FieldLabel htmlFor="note-tags">Tags</FieldLabel>
              <Input
                id="note-tags"
                value={formState.tagsText}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    tagsText: event.target.value,
                  }))
                }
                placeholder="exam, biology, chapter 3"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.tags)}
              />
              <FieldError>{errors.tags}</FieldError>
            </Field>
          </div>

          <Field orientation="horizontal">
            <Checkbox
              id="note-pinned"
              checked={formState.isPinned}
              onCheckedChange={(checked) =>
                setFormState((current) => ({
                  ...current,
                  isPinned: checked === true,
                }))
              }
              disabled={isSubmitting}
            />
            <FieldLabel htmlFor="note-pinned">Pin this note</FieldLabel>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            {note ? "Save changes" : "Create note"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
