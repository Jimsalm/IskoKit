"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  ArrowLeftIcon,
  BrainIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  flashcardMutationError,
  getDeckStatsForFlashcards,
} from "@/features/flashcards/api"
import { AiFlashcardDialog } from "@/features/flashcards/components/ai-flashcard-dialog"
import { FlashcardDeckDeleteDialog } from "@/features/flashcards/components/flashcard-deck-delete-dialog"
import { FlashcardDeckEditDialog } from "@/features/flashcards/components/flashcard-deck-edit-dialog"
import { FlashcardDeleteDialog } from "@/features/flashcards/components/flashcard-delete-dialog"
import { FlashcardGrid } from "@/features/flashcards/components/flashcard-grid"
import { ManualFlashcardDialog } from "@/features/flashcards/components/manual-flashcard-dialog"
import {
  useDeleteFlashcard,
  useDeleteFlashcardDeck,
  useFlashcardDeck,
  useFlashcardsByDeck,
} from "@/features/flashcards/hooks"
import type { Flashcard, FlashcardDeckStats } from "@/features/flashcards/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function DeckStats({ stats }: { stats: FlashcardDeckStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Cards" value={stats.totalCards} />
      <StatCard label="Due Today" value={stats.dueCards} />
      <StatCard label="Accuracy" value={`${stats.accuracyPercentage}%`} />
      <StatCard label="Mastered" value={stats.masteredCards} />
    </div>
  )
}

export function DeckDetailPageClient({ deckId }: { deckId: string }) {
  const router = useRouter()
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
  const [isDeckEditOpen, setIsDeckEditOpen] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null,
  )
  const [deletingFlashcard, setDeletingFlashcard] =
    useState<Flashcard | null>(null)
  const [isDeletingDeckOpen, setIsDeletingDeckOpen] = useState(false)
  const deckQuery = useFlashcardDeck(deckId)
  const flashcardsQuery = useFlashcardsByDeck(deckId)
  const deleteFlashcardMutation = useDeleteFlashcard(deckId)
  const deleteDeckMutation = useDeleteFlashcardDeck()
  const deck = deckQuery.data
  const flashcards = useMemo(
    () => flashcardsQuery.data ?? [],
    [flashcardsQuery.data],
  )
  const stats = useMemo(
    () => getDeckStatsForFlashcards(flashcards),
    [flashcards],
  )

  async function handleDeleteFlashcard() {
    if (!deletingFlashcard) {
      return
    }

    try {
      await deleteFlashcardMutation.mutateAsync(deletingFlashcard.id)
      toast.success("Flashcard deleted.")
      setDeletingFlashcard(null)
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  async function handleDeleteDeck() {
    if (!deck) {
      return
    }

    try {
      await deleteDeckMutation.mutateAsync(deck.id)
      toast.success("Deck deleted.")
      router.push("/flashcards")
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  if (deckQuery.isPending) {
    return (
      <section className="flex flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </section>
    )
  }

  if (deckQuery.isError || !deck) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>Could not load this deck</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          <span>
            {deckQuery.isError
              ? flashcardMutationError(deckQuery.error)
              : "The deck could not be found."}
          </span>
          <Button variant="outline" className="self-start" asChild>
            <Link href="/flashcards">Back to flashcards</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <Button variant="ghost" className="self-start" asChild>
        <Link href="/flashcards">
          <ArrowLeftIcon data-icon="inline-start" />
          Back to flashcards
        </Link>
      </Button>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{deck.subject}</Badge>
                {stats.dueCards ? <Badge>{stats.dueCards} due</Badge> : null}
              </div>
              <CardTitle className="text-2xl">{deck.title}</CardTitle>
              <CardDescription className="max-w-3xl leading-6">
                {deck.description ?? "No description yet."}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setIsDeckEditOpen(true)}>
                <PencilIcon data-icon="inline-start" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeletingDeckOpen(true)}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => setIsManualDialogOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add manually
          </Button>
          <Button variant="outline" onClick={() => setIsAiDialogOpen(true)}>
            <SparklesIcon data-icon="inline-start" />
            Generate with AI
          </Button>
          {flashcards.length ? (
            <Button asChild>
              <Link href={`/flashcards/${deck.id}/review`}>
                <BrainIcon data-icon="inline-start" />
                Review due
              </Link>
            </Button>
          ) : (
            <Button disabled>
              <BrainIcon data-icon="inline-start" />
              Review due
            </Button>
          )}
          {flashcards.length ? (
            <Button variant="outline" asChild>
              <Link href={`/flashcards/${deck.id}/review?scope=all`}>
                Review all
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Review all
            </Button>
          )}
        </CardContent>
      </Card>

      <DeckStats stats={stats} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">All cards</h2>
          <p className="text-sm text-muted-foreground">
            Edit cards, delete what you do not need, or start a review session.
          </p>
        </div>

        <FlashcardGrid
          flashcards={flashcards}
          isLoading={flashcardsQuery.isPending}
          errorMessage={
            flashcardsQuery.isError
              ? flashcardMutationError(flashcardsQuery.error)
              : undefined
          }
          onRetry={() => void flashcardsQuery.refetch()}
          onEdit={setEditingFlashcard}
          onDelete={setDeletingFlashcard}
        />
      </section>

      <ManualFlashcardDialog
        deckId={deck.id}
        open={isManualDialogOpen}
        onOpenChange={setIsManualDialogOpen}
      />
      <ManualFlashcardDialog
        deckId={deck.id}
        flashcard={editingFlashcard}
        open={Boolean(editingFlashcard)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingFlashcard(null)
          }
        }}
      />
      <AiFlashcardDialog
        deckId={deck.id}
        open={isAiDialogOpen}
        onOpenChange={setIsAiDialogOpen}
      />
      <FlashcardDeckEditDialog
        deck={deck}
        open={isDeckEditOpen}
        onOpenChange={setIsDeckEditOpen}
      />
      <FlashcardDeleteDialog
        flashcard={deletingFlashcard}
        isDeleting={deleteFlashcardMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFlashcard(null)
          }
        }}
        onConfirm={handleDeleteFlashcard}
      />
      <FlashcardDeckDeleteDialog
        deck={isDeletingDeckOpen ? deck : null}
        isDeleting={deleteDeckMutation.isPending}
        onOpenChange={setIsDeletingDeckOpen}
        onConfirm={handleDeleteDeck}
      />
    </section>
  )
}
