"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { toast } from "sonner"

import { flashcardMutationError } from "@/features/flashcards/api"
import { FlashcardDeckForm } from "@/features/flashcards/components/flashcard-deck-form"
import { useCreateFlashcardDeck } from "@/features/flashcards/hooks"
import type { DeckFormValues } from "@/features/flashcards/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CreateDeckPageClient() {
  const router = useRouter()
  const createDeckMutation = useCreateFlashcardDeck()

  async function handleSubmit(values: DeckFormValues) {
    try {
      const deck = await createDeckMutation.mutateAsync(values)
      toast.success("Deck created.")
      router.push(`/flashcards/${deck.id}`)
    } catch (error) {
      toast.error(flashcardMutationError(error))
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Button variant="ghost" className="self-start" asChild>
        <Link href="/flashcards">
          <ArrowLeftIcon data-icon="inline-start" />
          Back to flashcards
        </Link>
      </Button>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Flashcards
        </p>
        <h1 className="text-2xl font-semibold">Create deck</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Group cards by subject, exam, or topic so review stays organized.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deck details</CardTitle>
          <CardDescription>
            You can add manual or AI-generated cards after the deck is created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlashcardDeckForm
            isSaving={createDeckMutation.isPending}
            submitLabel="Create deck"
            onSubmit={(values) => void handleSubmit(values)}
          />
        </CardContent>
      </Card>
    </section>
  )
}
