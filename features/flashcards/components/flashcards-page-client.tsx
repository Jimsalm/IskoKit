"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  BrainIcon,
  Layers3Icon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { flashcardMutationError } from "@/features/flashcards/api"
import { useFlashcardDecks } from "@/features/flashcards/hooks"
import type { FlashcardDeckWithStats } from "@/features/flashcards/types"
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

function DeckDashboardLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-14 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DeckEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Layers3Icon />
        </EmptyMedia>
        <EmptyTitle>No flashcard decks yet</EmptyTitle>
        <EmptyDescription>
          Create a deck for a subject or exam, then add manual or AI-generated
          cards.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

function DeckCard({ deck }: { deck: FlashcardDeckWithStats }) {
  const hasDueCards = deck.stats.dueCards > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">{deck.title}</CardTitle>
        <CardDescription className="flex flex-wrap gap-2">
          <Badge variant="secondary">{deck.subject}</Badge>
          {hasDueCards ? <Badge>{deck.stats.dueCards} due</Badge> : null}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/flashcards/${deck.id}`} aria-label="Open deck">
              <ArrowRightIcon />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="line-clamp-3 min-h-12 text-sm leading-6 text-muted-foreground">
          {deck.description ?? "No description yet."}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <StatPill label="Cards" value={deck.stats.totalCards} />
          <StatPill label="Accuracy" value={`${deck.stats.accuracyPercentage}%`} />
          <StatPill label="Due" value={deck.stats.dueCards} />
          <StatPill label="Mastered" value={deck.stats.masteredCards} />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <Button variant="outline" asChild>
          <Link href={`/flashcards/${deck.id}`}>Open deck</Link>
        </Button>
        {deck.stats.totalCards ? (
          <Button asChild>
            <Link href={`/flashcards/${deck.id}/review`}>
              <BrainIcon data-icon="inline-start" />
              Review
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <BrainIcon data-icon="inline-start" />
            Review
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export function FlashcardsPageClient() {
  const decksQuery = useFlashcardDecks()
  const decks = decksQuery.data ?? []

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Study tools
          </p>
          <h1 className="text-2xl font-semibold">Flashcards</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Create subject decks, add cards manually or with AI, and review what
            is due.
          </p>
        </div>
        <Button asChild>
          <Link href="/flashcards/new">
            <PlusIcon data-icon="inline-start" />
            Create deck
          </Link>
        </Button>
      </div>

      {decksQuery.isPending ? <DeckDashboardLoading /> : null}

      {decksQuery.isError ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>Could not load decks</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{flashcardMutationError(decksQuery.error)}</span>
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => void decksQuery.refetch()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {!decksQuery.isPending && !decksQuery.isError && !decks.length ? (
        <DeckEmptyState />
      ) : null}

      {decks.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
