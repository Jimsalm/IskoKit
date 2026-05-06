"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createGwaRecord,
  deleteGwaRecord,
  getGwaRecord,
  listGwaRecords,
  updateGwaRecord,
} from "@/features/gwa/api"

export const gwaRecordsQueryKey = ["gwa-records"] as const
export const gwaRecordQueryKey = (id: string) => ["gwa-records", id] as const

export function useGwaRecords() {
  return useQuery({
    queryKey: gwaRecordsQueryKey,
    queryFn: listGwaRecords,
  })
}

export function useGwaRecord(id: string | null) {
  return useQuery({
    queryKey: id ? gwaRecordQueryKey(id) : ["gwa-records", "detail", "idle"],
    queryFn: () => getGwaRecord(id ?? ""),
    enabled: Boolean(id),
  })
}

export function useCreateGwaRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGwaRecord,
    onSuccess: (record) => {
      queryClient.setQueryData(gwaRecordQueryKey(record.id), record)
      void queryClient.invalidateQueries({ queryKey: gwaRecordsQueryKey })
    },
  })
}

export function useUpdateGwaRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGwaRecord,
    onSuccess: (record) => {
      queryClient.setQueryData(gwaRecordQueryKey(record.id), record)
      void queryClient.invalidateQueries({ queryKey: gwaRecordsQueryKey })
    },
  })
}

export function useDeleteGwaRecord() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGwaRecord,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: gwaRecordQueryKey(id) })
      void queryClient.invalidateQueries({ queryKey: gwaRecordsQueryKey })
    },
  })
}
