"use client"

import { useMemo } from "react"
import { RotateCcwIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { pomodoroMutationError } from "@/features/pomodoro/api"
import { PomodoroHistorySection } from "@/features/pomodoro/components/pomodoro-history-section"
import { PomodoroNextSessionCard } from "@/features/pomodoro/components/pomodoro-next-session-card"
import { usePomodoroTimer } from "@/features/pomodoro/components/pomodoro-provider"
import { PomodoroSummaryCards } from "@/features/pomodoro/components/pomodoro-summary-cards"
import { PomodoroTimerCard } from "@/features/pomodoro/components/pomodoro-timer-card"
import { useRecentPomodoroSessions } from "@/features/pomodoro/hooks"

export function PomodoroPageClient() {
  const pomodoroTimer = usePomodoroTimer()
  const recentSessionsQuery = useRecentPomodoroSessions()
  const recentSessions = useMemo(
    () => recentSessionsQuery.data ?? [],
    [recentSessionsQuery.data],
  )

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Planning</p>
        <h1 className="text-2xl font-semibold">Pomodoro Timer</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Stay focused and track your study sessions.
        </p>
      </div>

      <PomodoroSummaryCards
        summary={pomodoroTimer.summary}
        isLoading={pomodoroTimer.isSummaryLoading}
      />

      {pomodoroTimer.summaryErrorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load study summary</AlertTitle>
          <AlertDescription>{pomodoroTimer.summaryErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <PomodoroTimerCard
          mode={pomodoroTimer.mode}
          subject={pomodoroTimer.subject}
          taskLabel={pomodoroTimer.taskLabel}
          status={pomodoroTimer.status}
          timeRemaining={pomodoroTimer.timeRemaining}
          isSaving={pomodoroTimer.isSaving}
          onModeChange={pomodoroTimer.setMode}
          onSubjectChange={pomodoroTimer.setSubject}
          onTaskLabelChange={pomodoroTimer.setTaskLabel}
          onStart={pomodoroTimer.start}
          onPause={pomodoroTimer.pause}
          onResume={pomodoroTimer.resume}
          onReset={pomodoroTimer.reset}
        />

        <div className="flex flex-col gap-4">
          <PomodoroNextSessionCard
            mode={pomodoroTimer.suggestedMode}
            onSelect={pomodoroTimer.selectSuggestedMode}
          />

          {pomodoroTimer.pendingSessionSave ? (
            <Alert variant="destructive">
              <AlertTitle>Focus session was not saved</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>
                  Keep this page open and retry saving the completed session.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  disabled={pomodoroTimer.isSaving}
                  onClick={pomodoroTimer.retryPendingSessionSave}
                >
                  <RotateCcwIcon data-icon="inline-start" />
                  Retry save
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>

      <PomodoroHistorySection
        sessions={recentSessions}
        isLoading={recentSessionsQuery.isPending}
        isError={recentSessionsQuery.isError}
        errorMessage={pomodoroMutationError(recentSessionsQuery.error)}
        onRetry={() => void recentSessionsQuery.refetch()}
      />
    </section>
  )
}
