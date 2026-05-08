"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ExternalLinkIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  TimerIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePomodoroTimer } from "@/features/pomodoro/components/pomodoro-provider"
import {
  formatPomodoroMode,
  formatTimerTime,
  getPomodoroModeDurationSeconds,
  getTimerProgress,
} from "@/features/pomodoro/lib/timer"
import { cn } from "@/lib/utils"

export function PomodoroFloatingTimer() {
  const pathname = usePathname()
  const pomodoroTimer = usePomodoroTimer()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const isOnPomodoroPage =
    pathname === "/pomodoro" || pathname.startsWith("/pomodoro/")
  const isRunning = pomodoroTimer.status === "running"
  const isPaused = pomodoroTimer.status === "paused"
  const isActive = isRunning || isPaused
  const hasPendingSave = Boolean(pomodoroTimer.pendingSessionSave)

  if (isOnPomodoroPage || (!isActive && !hasPendingSave)) {
    return null
  }

  const durationSeconds = getPomodoroModeDurationSeconds(pomodoroTimer.mode)
  const progress = getTimerProgress(
    durationSeconds,
    pomodoroTimer.timeRemaining,
  )
  const statusLabel = hasPendingSave
    ? "Save needed"
    : isPaused
      ? "Paused"
      : "Running"
  const detailText =
    pomodoroTimer.mode === "focus" &&
    (pomodoroTimer.subject || pomodoroTimer.taskLabel)
      ? [pomodoroTimer.subject, pomodoroTimer.taskLabel]
          .filter(Boolean)
          .join(" · ")
      : formatPomodoroMode(pomodoroTimer.mode)

  function handleReset() {
    setIsResetDialogOpen(false)
    pomodoroTimer.reset()
  }

  return (
    <>
      <aside
        aria-live="polite"
        className="fixed right-4 bottom-4 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur sm:right-6 sm:bottom-6"
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-md",
              hasPendingSave ? "bg-destructive" : "bg-primary",
            )}
          >
            {pomodoroTimer.isSaving ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <TimerIcon />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Pomodoro {statusLabel.toLowerCase()}
                </p>
                <p className="truncate text-sm font-semibold">{detailText}</p>
              </div>
              <p className="font-mono text-2xl leading-none font-semibold tabular-nums">
                {hasPendingSave
                  ? "00:00"
                  : formatTimerTime(pomodoroTimer.timeRemaining)}
              </p>
            </div>

            <Progress
              value={hasPendingSave ? 100 : progress}
              className="mt-3 h-1.5"
              aria-label="Floating Pomodoro timer progress"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isRunning ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={pomodoroTimer.pause}
                >
                  <PauseIcon data-icon="inline-start" />
                  Pause
                </Button>
              ) : null}

              {isPaused ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={pomodoroTimer.resume}
                >
                  <PlayIcon data-icon="inline-start" />
                  Resume
                </Button>
              ) : null}

              {hasPendingSave ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={pomodoroTimer.isSaving}
                  onClick={pomodoroTimer.retryPendingSessionSave}
                >
                  {pomodoroTimer.isSaving ? (
                    <LoaderCircleIcon
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  ) : (
                    <RotateCcwIcon data-icon="inline-start" />
                  )}
                  Retry save
                </Button>
              ) : null}

              {isActive ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  <RotateCcwIcon data-icon="inline-start" />
                  Reset
                </Button>
              ) : null}

              <Button asChild type="button" size="sm" variant="ghost">
                <Link href="/pomodoro">
                  Open
                  <ExternalLinkIcon data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset timer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard the current countdown progress. Completed focus
              time is only saved when the timer reaches zero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep timer</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
