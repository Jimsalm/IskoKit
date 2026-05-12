"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createFileActivity,
  listFileActivities,
} from "@/features/pdf-tools/api"

export const fileActivitiesQueryKey = ["file-activities"] as const

export function useFileActivities() {
  return useQuery({
    queryKey: fileActivitiesQueryKey,
    queryFn: listFileActivities,
  })
}

export function useCreateFileActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFileActivity,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: fileActivitiesQueryKey,
      })
    },
  })
}
