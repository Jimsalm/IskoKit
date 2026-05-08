"use client"

import { useState } from "react"
import {
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  formatPomodoroMode,
  formatTimerTime,
  getPomodoroModeDurationMinutes,
  getPomodoroModeDurationSeconds,
  getTimerProgress,
} from "@/features/pomodoro/lib/timer"
import type { PomodoroMode, PomodoroTimerStatus } from "@/features/pomodoro/types"
import { pomodoroModes } from "@/features/pomodoro/types"

export function PomodoroTimerCard({
  mode,
  subject,
  taskLabel,
  status,
  timeRemaining,
  isSaving,
  onModeChange,
  onSubjectChange,
  onTaskLabelChange,
  onStart,
  onPause,
  onResume,
  onReset,
}: {
  mode: PomodoroMode
  subject: string
  taskLabel: string
  status: PomodoroTimerStatus
  timeRemaining: number
  isSaving: boolean
  onModeChange: (mode: PomodoroMode) => void
  onSubjectChange: (value: string) => void
  onTaskLabelChange: (value: string) => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
}) {
  const durationSeconds = getPomodoroModeDurationSeconds(mode)
  const durationMinutes = getPomodoroModeDurationMinutes(mode)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const isActive = status === "running" || status === "paused"
  const focusFieldsDisabled = isActive || isSaving || mode !== "focus"
  const progress = getTimerProgress(durationSeconds, timeRemaining)

  function handleResetClick() {
    if (isActive) {
      setIsResetDialogOpen(true)
      return
    }

    onReset()
  }

  function handleConfirmReset() {
    setIsResetDialogOpen(false)
    onReset()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Timer</CardTitle>
          <CardDescription>
            Select a mode, start the countdown, then save completed focus time.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>Mode</FieldLabel>
              <ToggleGroup
                type="single"
                value={mode}
                variant="outline"
                className="grid w-full grid-cols-3"
                disabled={isActive || isSaving}
                onValueChange={(value) => {
                  if (value) {
                    onModeChange(value as PomodoroMode)
                  }
                }}
              >
                {pomodoroModes.map((pomodoroMode) => (
                  <ToggleGroupItem key={pomodoroMode} value={pomodoroMode}>
                    {formatPomodoroMode(pomodoroMode)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field data-disabled={focusFieldsDisabled}>
                <FieldLabel htmlFor="pomodoro-subject">Subject</FieldLabel>
                <Input
                  id="pomodoro-subject"
                  value={subject}
                  onChange={(event) => onSubjectChange(event.target.value)}
                  placeholder="Optional"
                  disabled={focusFieldsDisabled}
                />
                <FieldDescription>
                  Saved only with completed focus sessions.
                </FieldDescription>
              </Field>

              <Field data-disabled={focusFieldsDisabled}>
                <FieldLabel htmlFor="pomodoro-task-label">
                  Task label
                </FieldLabel>
                <Input
                  id="pomodoro-task-label"
                  value={taskLabel}
                  onChange={(event) => onTaskLabelChange(event.target.value)}
                  placeholder="Optional"
                  disabled={focusFieldsDisabled}
                />
                <FieldDescription>
                  Example: Read chapter 3 or review quiz notes.
                </FieldDescription>
              </Field>
            </div>
          </FieldGroup>

          <div className="flex flex-col items-center gap-4 rounded-xl border bg-secondary/30 p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {formatPomodoroMode(mode)} · {durationMinutes} minutes
            </p>
            <p className="font-mono text-6xl leading-none font-semibold tabular-nums sm:text-7xl">
              {formatTimerTime(timeRemaining)}
            </p>
            <Progress value={progress} aria-label="Timer progress" />
          </div>
        </CardContent>

        <CardFooter className="flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {status === "idle" || status === "completed" ? (
              <Button type="button" disabled={isSaving} onClick={onStart}>
                {isSaving ? (
                  <LoaderCircleIcon
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <PlayIcon data-icon="inline-start" />
                )}
                Start
              </Button>
            ) : null}

            {status === "running" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={onPause}
              >
                <PauseIcon data-icon="inline-start" />
                Pause
              </Button>
            ) : null}

            {status === "paused" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={onResume}
              >
                <PlayIcon data-icon="inline-start" />
                Resume
              </Button>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={handleResetClick}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Reset
          </Button>
        </CardFooter>
      </Card>

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
            <AlertDialogAction onClick={handleConfirmReset}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
