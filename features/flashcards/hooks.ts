"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createDeck,
  createGeneratedFlashcards,
  createManualFlashcard,
  deleteDeck,
  deleteFlashcard,
  generateFlashcards,
  getDeck,
  listDecksWithStats,
  listFlashcardsByDeck,
  submitFlashcardReview,
  updateDeck,
  updateFlashcard,
} from "@/features/flashcards/api"

export const flashcardDecksQueryKey = ["flashcard-decks"] as const

export function flashcardDeckQueryKey(deckId: string) {
  return ["flashcard-decks", deckId] as const
}

export function flashcardsByDeckQueryKey(deckId: string) {
  return ["flashcards", deckId] as const
}

function invalidateDeckQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: flashcardDecksQueryKey })
}

function invalidateDeckDetailQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  deckId: string,
) {
  invalidateDeckQueries(queryClient)
  void queryClient.invalidateQueries({ queryKey: flashcardDeckQueryKey(deckId) })
  void queryClient.invalidateQueries({
    queryKey: flashcardsByDeckQueryKey(deckId),
  })
}

export function useFlashcardDecks() {
  return useQuery({
    queryKey: flashcardDecksQueryKey,
    queryFn: listDecksWithStats,
  })
}

export function useFlashcardDeck(deckId: string) {
  return useQuery({
    queryKey: flashcardDeckQueryKey(deckId),
    queryFn: () => getDeck(deckId),
  })
}

export function useFlashcardsByDeck(deckId: string) {
  return useQuery({
    queryKey: flashcardsByDeckQueryKey(deckId),
    queryFn: () => listFlashcardsByDeck(deckId),
  })
}

export function useGenerateFlashcards() {
  return useMutation({
    mutationFn: generateFlashcards,
  })
}

export function useCreateFlashcardDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDeck,
    onSuccess: () => {
      invalidateDeckQueries(queryClient)
    },
  })
}

export function useUpdateFlashcardDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDeck,
    onSuccess: (deck) => {
      invalidateDeckDetailQueries(queryClient, deck.id)
    },
  })
}

export function useDeleteFlashcardDeck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDeck,
    onSuccess: () => {
      invalidateDeckQueries(queryClient)
    },
  })
}

export function useCreateManualFlashcard(deckId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createManualFlashcard,
    onSuccess: () => {
      invalidateDeckDetailQueries(queryClient, deckId)
    },
  })
}

export function useUpdateFlashcard(deckId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateFlashcard,
    onSuccess: () => {
      invalidateDeckDetailQueries(queryClient, deckId)
    },
  })
}

export function useCreateGeneratedFlashcards(deckId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGeneratedFlashcards,
    onSuccess: () => {
      invalidateDeckDetailQueries(queryClient, deckId)
    },
  })
}

export function useDeleteFlashcard(deckId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      invalidateDeckDetailQueries(queryClient, deckId)
    },
  })
}

export function useSubmitFlashcardReview(deckId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitFlashcardReview,
    onSuccess: () => {
      invalidateDeckDetailQueries(queryClient, deckId)
    },
  })
}
