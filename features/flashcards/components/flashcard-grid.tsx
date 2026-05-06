"use client"

import {
  BrainIcon,
  FileTextIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  getFlashcardDifficultyLabel,
  getFlashcardSourceTypeLabel,
  getFlashcardTypeLabel,
} from "@/features/flashcards/api"
import { isFlashcardDue, isFlashcardMastered } from "@/features/flashcards/lib/review"
import type { Flashcard } from "@/features/flashcards/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

function formatFlashcardDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function getPreview(content: string) {
  const preview = content.replace(/\s+/g, " ").trim()

  return preview.length > 180 ? `${preview.slice(0, 180)}...` : preview
}

function FlashcardGridLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FlashcardGridEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BrainIcon />
        </EmptyMedia>
        <EmptyTitle>No cards in this deck yet</EmptyTitle>
        <EmptyDescription>
          Add cards manually or generate them from a note, summary, or pasted
          material.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function FlashcardGrid({
  flashcards,
  isLoading,
  errorMessage,
  onRetry,
  onEdit,
  onDelete,
}: {
  flashcards: Flashcard[]
  isLoading: boolean
  errorMessage?: string
  onRetry: () => void
  onEdit: (flashcard: Flashcard) => void
  onDelete: (flashcard: Flashcard) => void
}) {
  if (isLoading) {
    return <FlashcardGridLoading />
  }

  if (errorMessage) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>Could not load flashcards</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>{errorMessage}</span>
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={onRetry}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!flashcards.length) {
    return <FlashcardGridEmpty />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {flashcards.map((flashcard) => {
        const due = isFlashcardDue(flashcard)
        const mastered = isFlashcardMastered(flashcard)

        return (
          <Card key={flashcard.id}>
            <CardHeader>
              <CardTitle className="line-clamp-2">
                {flashcard.question}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {getPreview(flashcard.answer)}
              </CardDescription>
              <CardAction className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit flashcard"
                  onClick={() => onEdit(flashcard)}
                >
                  <PencilIcon />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete flashcard"
                  onClick={() => onDelete(flashcard)}
                >
                  <Trash2Icon />
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={due ? "default" : "outline"}>
                  {due ? "Due" : "Scheduled"}
                </Badge>
                {mastered ? <Badge variant="secondary">Mastered</Badge> : null}
                <Badge variant="outline">
                  {getFlashcardDifficultyLabel(flashcard.difficulty)}
                </Badge>
                <Badge variant="outline">
                  {getFlashcardTypeLabel(flashcard.type)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>
                  {flashcard.isAiGenerated ? (
                    <SparklesIcon data-icon="inline-start" />
                  ) : (
                    <FileTextIcon data-icon="inline-start" />
                  )}
                  {getFlashcardSourceTypeLabel(flashcard.sourceType)}
                </Badge>
                <Badge variant="outline">
                  {flashcard.correctCount} correct
                </Badge>
                <Badge variant="outline">
                  {flashcard.incorrectCount} missed
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="text-xs text-muted-foreground">
              Created {formatFlashcardDate(flashcard.createdAt)}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
