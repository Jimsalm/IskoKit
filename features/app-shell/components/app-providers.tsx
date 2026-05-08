"use client"

import { useState, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "@/components/ui/sonner"
import { PomodoroFloatingTimer } from "@/features/pomodoro/components/pomodoro-floating-timer"
import { PomodoroProvider } from "@/features/pomodoro/components/pomodoro-provider"

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PomodoroProvider>
        {children}
        <PomodoroFloatingTimer />
      </PomodoroProvider>
      <Toaster richColors theme="dark" />
    </QueryClientProvider>
  )
}
