"use client"

import { ArrowRightIcon, TimerResetIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatPomodoroMode } from "@/features/pomodoro/lib/timer"
import type { PomodoroMode } from "@/features/pomodoro/types"

export function PomodoroNextSessionCard({
  mode,
  onSelect,
}: {
  mode: PomodoroMode
  onSelect: (mode: PomodoroMode) => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
          <TimerResetIcon />
        </div>
        <CardTitle>Suggested next session</CardTitle>
        <CardDescription>
          {mode === "focus"
            ? "Break is done. Come back to a focused study block."
            : "Focus session saved. Take the break your brain earned."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="secondary" onClick={() => onSelect(mode)}>
          Start {formatPomodoroMode(mode)}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  )
}
