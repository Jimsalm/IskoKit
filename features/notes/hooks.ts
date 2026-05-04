"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "@/features/notes/api"

export const notesQueryKey = ["notes"] as const

export function useNotes() {
  return useQuery({
    queryKey: notesQueryKey,
    queryFn: listNotes,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey })
    },
  })
}
