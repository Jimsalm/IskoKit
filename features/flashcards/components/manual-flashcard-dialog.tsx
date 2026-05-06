"use client"

import { useState } from "react"
import { LoaderCircleIcon, SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { flashcardMutationError } from "@/features/flashcards/api"
import {
  flashcardDifficultyLabels,
  flashcardTypeLabels,
  manualFlashcardSchema,
  updateFlashcardSchema,
} from "@/features/flashcards/schemas"
import {
  useCreateManualFlashcard,
  useUpdateFlashcard,
} from "@/features/flashcards/hooks"
import {
  flashcardDifficulties,
  flashcardTypes,
} from "@/features/flashcards/types"
import type {
  Flashcard,
  FlashcardDifficulty,
  FlashcardType,
  ManualFlashcardValues,
  UpdateFlashcardValues,
} from "@/features/flashcards/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const emptyValues: UpdateFlashcardValues = {
  question: "",
  answer: "",
  difficulty: "medium",
  type: "qa",
}

function getInitialValues(flashcard?: Flashcard | null): UpdateFlashcardValues {
  if (!flashcard) {
    return emptyValues
  }

  return {
    question: flashcard.question,
    answer: flashcard.answer,
    difficulty: flashcard.difficulty,
    type: flashcard.type,
  }
}

function getZodMessage(error: {
  issues: Array<{
    message: string
  }>
}) {
  return error.issues[0]?.message ?? "Check the flashcard details."
}

export function ManualFlashcardDialog({
  deckId,
  flashcard,
  open,
  onOpenChange,
}: {
  deckId: string
  flashcard?: Flashcard | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEditing = Boolean(flashcard)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit flashcard" : "Add manual flashcard"}
          </DialogTitle>
          <DialogDescription>
            Write a question and answer that belongs to this deck.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ManualFlashcardForm
            key={flashcard?.id ?? "new-flashcard"}
            deckId={deckId}
            flashcard={flashcard}
            onComplete={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ManualFlashcardForm({
  deckId,
  flashcard,
  onComplete,
}: {
  deckId: string
  flashcard?: Flashcard | null
  onComplete: () => void
}) {
  const [values, setValues] = useState<UpdateFlashcardValues>(() =>
    getInitialValues(flashcard),
  )
  const [errorMessage, setErrorMessage] = useState("")
  const createMutation = useCreateManualFlashcard(deckId)
  const updateMutation = useUpdateFlashcard(deckId)
  const isEditing = Boolean(flashcard)
  const isSaving = createMutation.isPending || updateMutation.isPending

  function updateField(
    field: keyof UpdateFlashcardValues,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
    setErrorMessage("")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = isEditing
      ? updateFlashcardSchema.safeParse(values)
      : manualFlashcardSchema.safeParse(values)

    if (!parsed.success) {
      setErrorMessage(getZodMessage(parsed.error))
      return
    }

    try {
      if (isEditing && flashcard) {
        await updateMutation.mutateAsync({
          id: flashcard.id,
          values: parsed.data as UpdateFlashcardValues,
        })
        toast.success("Flashcard updated.")
      } else {
        await createMutation.mutateAsync({
          deckId,
          values: parsed.data as ManualFlashcardValues,
        })
        toast.success("Flashcard added.")
      }

      onComplete()
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(errorMessage)}>
          <FieldLabel htmlFor="manual-flashcard-question">Question</FieldLabel>
          <Textarea
            id="manual-flashcard-question"
            value={values.question}
            className="min-h-28"
            disabled={isSaving}
            aria-invalid={Boolean(errorMessage)}
            onChange={(event) => updateField("question", event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="manual-flashcard-answer">Answer</FieldLabel>
          <Textarea
            id="manual-flashcard-answer"
            value={values.answer}
            className="min-h-36"
            disabled={isSaving}
            onChange={(event) => updateField("answer", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="manual-flashcard-difficulty">
              Difficulty
            </FieldLabel>
            <Select
              value={values.difficulty}
              disabled={isSaving}
              onValueChange={(value) =>
                updateField("difficulty", value as FlashcardDifficulty)
              }
            >
              <SelectTrigger
                id="manual-flashcard-difficulty"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Difficulty</SelectLabel>
                  {flashcardDifficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {flashcardDifficultyLabels[difficulty]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="manual-flashcard-type">Type</FieldLabel>
            <Select
              value={values.type}
              disabled={isSaving || !isEditing}
              onValueChange={(value) =>
                updateField("type", value as FlashcardType)
              }
            >
              <SelectTrigger id="manual-flashcard-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  {flashcardTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {flashcardTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FieldGroup>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <Button type="submit" className="self-start" disabled={isSaving}>
        {isSaving ? (
          <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
        ) : (
          <SaveIcon data-icon="inline-start" />
        )}
        {isEditing ? "Save changes" : "Add flashcard"}
      </Button>
    </form>
  )
}
