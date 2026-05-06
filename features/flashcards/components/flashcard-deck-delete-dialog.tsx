"use client"

import { LoaderCircleIcon, Trash2Icon } from "lucide-react"

import type { FlashcardDeck } from "@/features/flashcards/types"
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

export function FlashcardDeckDeleteDialog({
  deck,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  deck: FlashcardDeck | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}) {
  return (
    <AlertDialog open={Boolean(deck)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this deck?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the deck, its flashcards, and review
            history. This action cannot be undone.
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
            Delete deck
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
