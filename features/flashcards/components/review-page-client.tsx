"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowLeftIcon,
  BrainIcon,
  CheckIcon,
  RotateCcwIcon,
  ThumbsDownIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import { flashcardMutationError } from "@/features/flashcards/api"
import { isFlashcardDue } from "@/features/flashcards/lib/review"
import {
  useFlashcardDeck,
  useFlashcardsByDeck,
  useSubmitFlashcardReview,
} from "@/features/flashcards/hooks"
import type {
  Flashcard,
  ReviewRating,
  ReviewScope,
} from "@/features/flashcards/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function sortReviewCards(flashcards: Flashcard[]) {
  return [...flashcards].sort((first, second) => {
    const firstDue = isFlashcardDue(first)
    const secondDue = isFlashcardDue(second)

    if (firstDue !== secondDue) {
      return firstDue ? -1 : 1
    }

    const firstTime = first.nextReviewAt
      ? new Date(first.nextReviewAt).getTime()
      : 0
    const secondTime = second.nextReviewAt
      ? new Date(second.nextReviewAt).getTime()
      : 0

    return firstTime - secondTime
  })
}

export function ReviewPageClient({
  deckId,
  scope,
}: {
  deckId: string
  scope: ReviewScope
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedIds, setReviewedIds] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const deckQuery = useFlashcardDeck(deckId)
  const flashcardsQuery = useFlashcardsByDeck(deckId)
  const reviewMutation = useSubmitFlashcardReview(deckId)
  const flashcards = useMemo(
    () => flashcardsQuery.data ?? [],
    [flashcardsQuery.data],
  )
  const reviewCards = useMemo(() => {
    const pool =
      scope === "due" ? flashcards.filter(isFlashcardDue) : flashcards

    return sortReviewCards(
      pool.filter((flashcard) => !reviewedIds.includes(flashcard.id)),
    )
  }, [flashcards, reviewedIds, scope])
  const activeCard = reviewCards[0]
  const reviewedTotal = correctCount + incorrectCount
  const totalForSession = reviewedTotal + reviewCards.length
  const accuracy = reviewedTotal
    ? Math.round((correctCount / reviewedTotal) * 100)
    : 0

  async function submitReview(rating: ReviewRating | "incorrect") {
    if (!activeCard || reviewMutation.isPending) {
      return
    }

    const isIncorrect = rating === "incorrect"

    try {
      await reviewMutation.mutateAsync({
        deckId,
        flashcardId: activeCard.id,
        result: isIncorrect ? "incorrect" : "correct",
        rating: isIncorrect ? null : rating,
      })
      setReviewedIds((current) => [...current, activeCard.id])
      setIsFlipped(false)

      if (isIncorrect) {
        setIncorrectCount((current) => current + 1)
      } else {
        setCorrectCount((current) => current + 1)
      }
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  if (deckQuery.isPending || flashcardsQuery.isPending) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </section>
    )
  }

  if (deckQuery.isError || flashcardsQuery.isError || !deckQuery.data) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>Could not load review</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>
            {deckQuery.isError
              ? flashcardMutationError(deckQuery.error)
              : flashcardsQuery.isError
                ? flashcardMutationError(flashcardsQuery.error)
                : "The deck could not be found."}
          </span>
          <Button variant="outline" className="self-start" asChild>
            <Link href={`/flashcards/${deckId}`}>Back to deck</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!activeCard) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Button variant="ghost" className="self-start" asChild>
          <Link href={`/flashcards/${deckId}`}>
            <ArrowLeftIcon data-icon="inline-start" />
            Back to deck
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Review complete</CardTitle>
            <CardDescription>
              {reviewedTotal
                ? "Nice work. Your cards have been scheduled for the next review."
                : scope === "due"
                  ? "No cards are due right now."
                  : "This deck has no cards to review yet."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Reviewed</p>
              <p className="mt-1 text-2xl font-semibold">{reviewedTotal}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="mt-1 text-2xl font-semibold">{correctCount}</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Accuracy</p>
              <p className="mt-1 text-2xl font-semibold">{accuracy}%</p>
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="outline" asChild>
              <Link href={`/flashcards/${deckId}`}>Back to deck</Link>
            </Button>
            {scope === "due" ? (
              <Button asChild>
                <Link href={`/flashcards/${deckId}/review?scope=all`}>
                  Review all
                </Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="self-start" asChild>
            <Link href={`/flashcards/${deckId}`}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back to deck
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {deckQuery.data.title}
            </p>
            <h1 className="text-2xl font-semibold">
              {scope === "due" ? "Review due cards" : "Review all cards"}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {reviewedTotal + 1} of {totalForSession}
          </Badge>
          <Badge variant="outline">{correctCount} correct</Badge>
          <Badge variant="outline">{incorrectCount} missed</Badge>
        </div>
      </div>

      <div className="[perspective:1200px]">
        <button
          type="button"
          className="min-h-96 w-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-pressed={isFlipped}
          onClick={() => setIsFlipped((current) => !current)}
        >
          <div
            className={cn(
              "relative min-h-96 transition-transform duration-300 [transform-style:preserve-3d]",
              isFlipped && "[transform:rotateY(180deg)]",
            )}
          >
            <div className="absolute inset-0 flex flex-col justify-between gap-6 rounded-xl border bg-card p-6 text-card-foreground [backface-visibility:hidden]">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Question
                </p>
                <p className="text-2xl leading-snug font-semibold">
                  {activeCard.question}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the card or use Reveal answer.
              </p>
            </div>
            <div className="absolute inset-0 flex flex-col justify-between gap-6 overflow-y-auto rounded-xl border bg-card p-6 text-card-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Answer
                </p>
                <p className="text-lg leading-7">{activeCard.answer}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Mark how this card felt to schedule the next review.
              </p>
            </div>
          </div>
        </button>
      </div>

      {!isFlipped ? (
        <Button
          type="button"
          className="self-center"
          onClick={() => setIsFlipped(true)}
        >
          <RotateCcwIcon data-icon="inline-start" />
          Reveal answer
        </Button>
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="destructive"
            disabled={reviewMutation.isPending}
            onClick={() => void submitReview("incorrect")}
          >
            <ThumbsDownIcon data-icon="inline-start" />
            Incorrect
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={reviewMutation.isPending}
            onClick={() => void submitReview("hard")}
          >
            Hard
          </Button>
          <Button
            type="button"
            disabled={reviewMutation.isPending}
            onClick={() => void submitReview("good")}
          >
            <CheckIcon data-icon="inline-start" />
            Good
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={reviewMutation.isPending}
            onClick={() => void submitReview("easy")}
          >
            Easy
          </Button>
        </div>
      )}

      {!flashcards.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BrainIcon />
            </EmptyMedia>
            <EmptyTitle>No cards to review</EmptyTitle>
            <EmptyDescription>
              Add manual or AI-generated cards to start reviewing.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
    </section>
  )
}
