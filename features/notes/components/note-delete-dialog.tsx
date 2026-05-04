"use client"

import { LoaderCircleIcon, Trash2Icon } from "lucide-react"

import type { Note } from "@/features/notes/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function NoteDeleteDialog({
  note,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  note: Note | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}) {
  return (
    <AlertDialog open={Boolean(note)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this note?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete
            {note ? ` "${note.title}"` : " this note"}. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
          >
            {isDeleting ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
