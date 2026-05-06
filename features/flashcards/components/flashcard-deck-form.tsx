"use client"

import { LoaderCircleIcon, SaveIcon } from "lucide-react"
import { useState } from "react"

import { deckFormSchema } from "@/features/flashcards/schemas"
import type { DeckFormValues, FlashcardDeck } from "@/features/flashcards/types"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const emptyValues: DeckFormValues = {
  title: "",
  description: "",
  subject: "",
  color: "",
  icon: "",
}

function getInitialValues(deck?: FlashcardDeck | null): DeckFormValues {
  if (!deck) {
    return emptyValues
  }

  return {
    title: deck.title,
    description: deck.description ?? "",
    subject: deck.subject,
    color: deck.color ?? "",
    icon: deck.icon ?? "",
  }
}

function getZodMessage(error: {
  issues: Array<{
    message: string
  }>
}) {
  return error.issues[0]?.message ?? "Check the deck details."
}

export function FlashcardDeckForm({
  deck,
  isSaving,
  submitLabel,
  onSubmit,
}: {
  deck?: FlashcardDeck | null
  isSaving: boolean
  submitLabel: string
  onSubmit: (values: DeckFormValues) => void
}) {
  const [values, setValues] = useState<DeckFormValues>(() =>
    getInitialValues(deck),
  )
  const [errorMessage, setErrorMessage] = useState("")

  function updateField(field: keyof DeckFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
    setErrorMessage("")
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = deckFormSchema.safeParse(values)

    if (!parsed.success) {
      setErrorMessage(getZodMessage(parsed.error))
      return
    }

    onSubmit(parsed.data)
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(errorMessage)}>
          <FieldLabel htmlFor="deck-title">Deck title</FieldLabel>
          <Input
            id="deck-title"
            value={values.title}
            placeholder="Database Systems Midterm"
            disabled={isSaving}
            aria-invalid={Boolean(errorMessage)}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="deck-subject">Subject</FieldLabel>
          <Input
            id="deck-subject"
            value={values.subject}
            placeholder="Database Systems"
            disabled={isSaving}
            onChange={(event) => updateField("subject", event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="deck-description">Description</FieldLabel>
          <Textarea
            id="deck-description"
            value={values.description}
            placeholder="Reviewer for ERD, normalization, and SQL topics."
            className="min-h-24"
            disabled={isSaving}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
          />
          <FieldDescription>Optional, shown on deck cards.</FieldDescription>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="deck-color">Color</FieldLabel>
            <Input
              id="deck-color"
              value={values.color}
              placeholder="violet"
              disabled={isSaving}
              onChange={(event) => updateField("color", event.target.value)}
            />
            <FieldDescription>Optional label only for MVP.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="deck-icon">Icon</FieldLabel>
            <Input
              id="deck-icon"
              value={values.icon}
              placeholder="book"
              disabled={isSaving}
              onChange={(event) => updateField("icon", event.target.value)}
            />
            <FieldDescription>Optional label only for MVP.</FieldDescription>
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
        {submitLabel}
      </Button>
    </form>
  )
}
