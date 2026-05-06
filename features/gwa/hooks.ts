"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createGwaRecord,
  deleteGwaRecord,
  listGwaRecords,
  updateGwaRecord,
} from "@/features/gwa/api"

export const gwaRecordsQueryKey = ["gwa-records"] as const

export function useGwaRecords() {
  return useQuery({
    queryKey: gwaRecordsQueryKey,
    queryFn: listGwaRecords,
  })
}

export function useCreateGwaRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGwaRecord,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gwaRecordsQueryKey })
    },
  })
}

export function useUpdateGwaRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGwaRecord,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gwaRecordsQueryKey })
    },
  })
}

export function useDeleteGwaRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGwaRecord,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: gwaRecordsQueryKey })
    },
  })
}
