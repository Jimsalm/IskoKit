"use client"

import { LoaderCircleIcon, SaveIcon, Trash2Icon } from "lucide-react"

import {
  getFlashcardDifficultyLabel,
  getFlashcardTypeLabel,
} from "@/features/flashcards/api"
import type { FlashcardPreview } from "@/features/flashcards/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function FlashcardPreviewList({
  flashcards,
  isSaving,
  onFlashcardChange,
  onRemove,
  onSave,
}: {
  flashcards: FlashcardPreview[]
  isSaving: boolean
  onFlashcardChange: (
    previewId: string,
    field: "question" | "answer",
    value: string,
  ) => void
  onRemove: (previewId: string) => void
  onSave: () => void
}) {
  if (!flashcards.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview before saving</CardTitle>
        <CardDescription>
          Edit questions and answers, remove what you do not need, then save the
          remaining cards to this deck.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {flashcards.map((flashcard, index) => (
          <div
            key={flashcard.previewId}
            className="flex flex-col gap-4 rounded-xl border bg-background p-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Card {index + 1}</Badge>
                <Badge variant="outline">
                  {getFlashcardDifficultyLabel(flashcard.difficulty)}
                </Badge>
                <Badge variant="outline">
                  {getFlashcardTypeLabel(flashcard.type)}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSaving}
                onClick={() => onRemove(flashcard.previewId)}
              >
                <Trash2Icon data-icon="inline-start" />
                Remove
              </Button>
            </div>

            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor={`${flashcard.previewId}-question`}>
                  Question
                </FieldLabel>
                <Input
                  id={`${flashcard.previewId}-question`}
                  value={flashcard.question}
                  disabled={isSaving}
                  onChange={(event) =>
                    onFlashcardChange(
                      flashcard.previewId,
                      "question",
                      event.target.value,
                    )
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${flashcard.previewId}-answer`}>
                  Answer
                </FieldLabel>
                <Textarea
                  id={`${flashcard.previewId}-answer`}
                  value={flashcard.answer}
                  className="min-h-28"
                  disabled={isSaving}
                  onChange={(event) =>
                    onFlashcardChange(
                      flashcard.previewId,
                      "answer",
                      event.target.value,
                    )
                  }
                />
              </Field>
            </FieldGroup>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {flashcards.length} {flashcards.length === 1 ? "card" : "cards"} ready
          to save
        </p>
        <Button type="button" disabled={isSaving} onClick={onSave}>
          {isSaving ? (
            <LoaderCircleIcon
              data-icon="inline-start"
              className="animate-spin"
            />
          ) : (
            <SaveIcon data-icon="inline-start" />
          )}
          Save to deck
        </Button>
      </CardFooter>
    </Card>
  )
}
