"use client"

import { toast } from "sonner"

import { flashcardMutationError } from "@/features/flashcards/api"
import { FlashcardDeckForm } from "@/features/flashcards/components/flashcard-deck-form"
import { useUpdateFlashcardDeck } from "@/features/flashcards/hooks"
import type { DeckFormValues, FlashcardDeck } from "@/features/flashcards/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function FlashcardDeckEditDialog({
  deck,
  open,
  onOpenChange,
}: {
  deck: FlashcardDeck
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateDeckMutation = useUpdateFlashcardDeck()

  async function handleSubmit(values: DeckFormValues) {
    try {
      await updateDeckMutation.mutateAsync({
        id: deck.id,
        values,
      })
      toast.success("Deck updated.")
      onOpenChange(false)
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,760px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit deck</DialogTitle>
          <DialogDescription>
            Update the title, subject, or short description for this deck.
          </DialogDescription>
        </DialogHeader>
        <FlashcardDeckForm
          key={`${deck.id}-${deck.updatedAt}`}
          deck={deck}
          isSaving={updateDeckMutation.isPending}
          submitLabel="Save changes"
          onSubmit={(values) => void handleSubmit(values)}
        />
      </DialogContent>
    </Dialog>
  )
}
