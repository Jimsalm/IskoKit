"use client"

import {
  FileTextIcon,
  LoaderCircleIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  flashcardCounts,
  flashcardDifficulties,
  flashcardGenerationSourceTypes,
  flashcardTypes,
} from "@/features/flashcards/types"
import type {
  FlashcardCount,
  FlashcardDifficulty,
  FlashcardGenerationSourceType,
  FlashcardNoteSource,
  FlashcardSummarySource,
  FlashcardType,
} from "@/features/flashcards/types"
import {
  flashcardDifficultyLabels,
  flashcardSourceTypeLabels,
  flashcardTypeLabels,
  maxFlashcardSourceLength,
  minFlashcardSourceLength,
} from "@/features/flashcards/schemas"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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

export function FlashcardGenerator({
  sourceType,
  manualText,
  selectedNoteId,
  selectedSummaryId,
  notes,
  summaries,
  isNotesLoading,
  isSummariesLoading,
  cardType,
  difficulty,
  count,
  sourceError,
  isGenerating,
  onSourceTypeChange,
  onManualTextChange,
  onNoteChange,
  onSummaryChange,
  onCardTypeChange,
  onDifficultyChange,
  onCountChange,
  onGenerate,
}: {
  sourceType: FlashcardGenerationSourceType
  manualText: string
  selectedNoteId: string
  selectedSummaryId: string
  notes: FlashcardNoteSource[]
  summaries: FlashcardSummarySource[]
  isNotesLoading: boolean
  isSummariesLoading: boolean
  cardType: FlashcardType
  difficulty: FlashcardDifficulty
  count: FlashcardCount
  sourceError: string
  isGenerating: boolean
  onSourceTypeChange: (sourceType: FlashcardGenerationSourceType) => void
  onManualTextChange: (value: string) => void
  onNoteChange: (id: string) => void
  onSummaryChange: (id: string) => void
  onCardTypeChange: (cardType: FlashcardType) => void
  onDifficultyChange: (difficulty: FlashcardDifficulty) => void
  onCountChange: (count: FlashcardCount) => void
  onGenerate: () => void
}) {
  const selectedNote = notes.find((note) => note.id === selectedNoteId)
  const selectedSummary = summaries.find(
    (summary) => summary.id === selectedSummaryId,
  )
  const sourceLength = manualText.trim().length
  const hasSavedSource =
    sourceType === "note" ? Boolean(selectedNote) : Boolean(selectedSummary)

  return (
    <div className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="flashcard-source-type">Source</FieldLabel>
          <Select
            value={sourceType}
            onValueChange={(value) =>
              onSourceTypeChange(value as FlashcardGenerationSourceType)
            }
            disabled={isGenerating}
          >
            <SelectTrigger id="flashcard-source-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Source</SelectLabel>
                {flashcardGenerationSourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {flashcardSourceTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {sourceType === "manual_text" ? (
          <Field>
            <FieldLabel htmlFor="flashcard-source-text">
              Source material
            </FieldLabel>
            <Textarea
              id="flashcard-source-text"
              value={manualText}
              placeholder="Paste class notes, readings, or reviewer content here."
              className="min-h-72"
              disabled={isGenerating}
              onChange={(event) => onManualTextChange(event.target.value)}
            />
            <FieldDescription>
              {sourceLength.toLocaleString()} /{" "}
              {maxFlashcardSourceLength.toLocaleString()} characters. Minimum{" "}
              {minFlashcardSourceLength.toLocaleString()} characters.
            </FieldDescription>
          </Field>
        ) : null}

        {sourceType === "note" ? (
          <Field>
            <FieldLabel htmlFor="flashcard-note-source">Saved note</FieldLabel>
            <Select
              value={selectedNoteId}
              onValueChange={onNoteChange}
              disabled={isGenerating || isNotesLoading || notes.length === 0}
            >
              <SelectTrigger id="flashcard-note-source" className="w-full">
                <SelectValue
                  placeholder={
                    isNotesLoading ? "Loading notes..." : "Choose a note"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Notes</SelectLabel>
                  {notes.map((note) => (
                    <SelectItem key={note.id} value={note.id}>
                      {note.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              {notes.length
                ? "Flashcards will load the note content when you generate."
                : "Create a note first to use this source."}
            </FieldDescription>
          </Field>
        ) : null}

        {sourceType === "summary" ? (
          <Field>
            <FieldLabel htmlFor="flashcard-summary-source">
              Saved AI summary
            </FieldLabel>
            <Select
              value={selectedSummaryId}
              onValueChange={onSummaryChange}
              disabled={
                isGenerating || isSummariesLoading || summaries.length === 0
              }
            >
              <SelectTrigger id="flashcard-summary-source" className="w-full">
                <SelectValue
                  placeholder={
                    isSummariesLoading
                      ? "Loading summaries..."
                      : "Choose a summary"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Summaries</SelectLabel>
                  {summaries.map((summary) => (
                    <SelectItem key={summary.id} value={summary.id}>
                      {summary.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              {summaries.length
                ? "Flashcards will load the summary content when you generate."
                : "Save an AI summary first to use this source."}
            </FieldDescription>
          </Field>
        ) : null}

        {sourceType !== "manual_text" && hasSavedSource ? (
          <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <FileTextIcon />
              <p className="text-sm font-medium">
                {selectedNote?.title ?? selectedSummary?.title}
              </p>
              {selectedNote?.subject ? (
                <Badge variant="secondary">{selectedNote.subject}</Badge>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Content will be loaded only when you generate flashcards.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="flashcard-type">Type</FieldLabel>
            <Select
              value={cardType}
              onValueChange={(value) => onCardTypeChange(value as FlashcardType)}
              disabled={isGenerating}
            >
              <SelectTrigger id="flashcard-type" className="w-full">
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

          <Field>
            <FieldLabel htmlFor="flashcard-difficulty">Difficulty</FieldLabel>
            <Select
              value={difficulty}
              onValueChange={(value) =>
                onDifficultyChange(value as FlashcardDifficulty)
              }
              disabled={isGenerating}
            >
              <SelectTrigger id="flashcard-difficulty" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Difficulty</SelectLabel>
                  {flashcardDifficulties.map((item) => (
                    <SelectItem key={item} value={item}>
                      {flashcardDifficultyLabels[item]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="flashcard-count">Cards</FieldLabel>
            <Select
              value={String(count)}
              onValueChange={(value) =>
                onCountChange(Number(value) as FlashcardCount)
              }
              disabled={isGenerating}
            >
              <SelectTrigger id="flashcard-count" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cards</SelectLabel>
                  {flashcardCounts.map((item) => (
                    <SelectItem key={item} value={String(item)}>
                      {item} cards
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {sourceError ? (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>Could not generate flashcards</AlertTitle>
            <AlertDescription>{sourceError}</AlertDescription>
          </Alert>
        ) : null}
      </FieldGroup>

      <Button
        type="button"
        className="self-start"
        disabled={isGenerating}
        onClick={onGenerate}
      >
        {isGenerating ? (
          <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
        ) : (
          <SparklesIcon data-icon="inline-start" />
        )}
        Generate flashcards
      </Button>
    </div>
  )
}
