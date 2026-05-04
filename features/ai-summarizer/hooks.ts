"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { notesQueryKey } from "@/features/notes/hooks"
import {
  createSummary,
  deleteSummary,
  extractTextFromFile,
  generateSummary,
  listSummaries,
  saveSummaryAsNote,
} from "@/features/ai-summarizer/api"

export const summariesQueryKey = ["summaries"] as const

export function useSummaries() {
  return useQuery({
    queryKey: summariesQueryKey,
    queryFn: listSummaries,
  })
}

export function useExtractTextFromFile() {
  return useMutation({
    mutationFn: extractTextFromFile,
  })
}

export function useGenerateSummary() {
  return useMutation({
    mutationFn: generateSummary,
  })
}

export function useCreateSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSummary,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: summariesQueryKey })
    },
  })
}

export function useDeleteSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSummary,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: summariesQueryKey })
    },
  })
}

export function useSaveSummaryAsNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSummaryAsNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey })
    },
  })
}
