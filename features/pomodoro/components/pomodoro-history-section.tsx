"use client"

import { HistoryIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PomodoroError } from "@/features/pomodoro/components/pomodoro-error"
import { PomodoroLoading } from "@/features/pomodoro/components/pomodoro-loading"
import type { PomodoroSession } from "@/features/pomodoro/types"

function formatCompletedAt(value: string | null) {
  if (!value) {
    return "No completion time"
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

export function PomodoroHistorySection({
  sessions,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: {
  sessions: PomodoroSession[]
  isLoading: boolean
  isError: boolean
  errorMessage: string
  onRetry: () => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        <p className="text-sm text-muted-foreground">
          Your latest completed focus sessions.
        </p>
      </div>

      {isLoading ? <PomodoroLoading /> : null}

      {isError ? (
        <PomodoroError
          title="Could not load recent sessions"
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : null}

      {!isLoading && !isError && !sessions.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon />
            </EmptyMedia>
            <EmptyTitle>No completed sessions yet</EmptyTitle>
            <EmptyDescription>
              Finish a focus timer to start building your study history.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!isLoading && !isError && sessions.length ? (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle>
                  {session.taskLabel ?? "Focus study session"}
                </CardTitle>
                <CardDescription>
                  Completed {formatCompletedAt(session.completedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {session.subject ? (
                  <Badge variant="secondary">{session.subject}</Badge>
                ) : (
                  <Badge variant="outline">No subject</Badge>
                )}
                <Badge variant="outline">{session.actualMinutes} min</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  )
}
