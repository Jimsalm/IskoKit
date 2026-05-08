"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  cancelPomodoroFocusSession,
  completePomodoroFocusSession,
  listPomodoroStatsRows,
  listRecentPomodoroSessions,
  startPomodoroFocusSession,
} from "@/features/pomodoro/api"
import type { PomodoroStatsRange } from "@/features/pomodoro/types"

export const pomodoroSessionsQueryKey = ["pomodoro-sessions"] as const

export const pomodoroStatsQueryKey = (range: PomodoroStatsRange | null) =>
  [
    "pomodoro-stats",
    range?.from ?? "idle",
    range?.to ?? "idle",
  ] as const

export function useRecentPomodoroSessions() {
  return useQuery({
    queryKey: pomodoroSessionsQueryKey,
    queryFn: listRecentPomodoroSessions,
  })
}

export function usePomodoroStatsRows(range: PomodoroStatsRange | null) {
  return useQuery({
    queryKey: pomodoroStatsQueryKey(range),
    queryFn: () =>
      listPomodoroStatsRows(
        range ?? {
          from: "",
          to: "",
        },
      ),
    enabled: Boolean(range),
  })
}

export function useStartPomodoroFocusSession() {
  return useMutation({
    mutationFn: startPomodoroFocusSession,
  })
}

export function useCompletePomodoroFocusSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completePomodoroFocusSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: pomodoroSessionsQueryKey,
      })
      void queryClient.invalidateQueries({
        queryKey: ["pomodoro-stats"],
      })
    },
  })
}

export function useCancelPomodoroFocusSession() {
  return useMutation({
    mutationFn: cancelPomodoroFocusSession,
  })
}
