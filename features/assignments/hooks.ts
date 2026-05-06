"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createAssignment,
  deleteAssignment,
  listAssignments,
  listAssignmentStats,
  setAssignmentCompleted,
  updateAssignment,
} from "@/features/assignments/api"

export const assignmentsQueryKey = ["assignments"] as const
export const assignmentStatsQueryKey = ["assignment-stats"] as const

function invalidateAssignmentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey })
  void queryClient.invalidateQueries({ queryKey: assignmentStatsQueryKey })
}

export function useAssignments() {
  return useQuery({
    queryKey: assignmentsQueryKey,
    queryFn: listAssignments,
  })
}

export function useAssignmentStats() {
  return useQuery({
    queryKey: assignmentStatsQueryKey,
    queryFn: listAssignmentStats,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      invalidateAssignmentQueries(queryClient)
    },
  })
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAssignment,
    onSuccess: () => {
      invalidateAssignmentQueries(queryClient)
    },
  })
}

export function useSetAssignmentCompleted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setAssignmentCompleted,
    onSuccess: () => {
      invalidateAssignmentQueries(queryClient)
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      invalidateAssignmentQueries(queryClient)
    },
  })
}
