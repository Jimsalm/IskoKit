import {
  pomodoroModeDurations,
  pomodoroModeLabels,
} from "@/features/pomodoro/schemas"
import type {
  PomodoroMode,
  PomodoroStatsRange,
  PomodoroStatsRow,
  PomodoroSummary,
} from "@/features/pomodoro/types"

export function getPomodoroModeDurationMinutes(mode: PomodoroMode) {
  return pomodoroModeDurations[mode]
}

export function getPomodoroModeDurationSeconds(mode: PomodoroMode) {
  return getPomodoroModeDurationMinutes(mode) * 60
}

export function formatTimerTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function getTimerProgress(durationSeconds: number, timeRemaining: number) {
  if (!durationSeconds) {
    return 0
  }

  return Math.min(
    100,
    Math.max(0, ((durationSeconds - timeRemaining) / durationSeconds) * 100),
  )
}

export function getSuggestedNextPomodoroMode({
  completedMode,
  completedFocusSessionsToday,
}: {
  completedMode: PomodoroMode
  completedFocusSessionsToday: number
}): PomodoroMode {
  if (completedMode !== "focus") {
    return "focus"
  }

  return completedFocusSessionsToday > 0 &&
    completedFocusSessionsToday % 4 === 0
    ? "long_break"
    : "short_break"
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)

  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export function getTodayRange(now: Date): PomodoroStatsRange {
  const start = startOfLocalDay(now)
  const end = addDays(start, 1)

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  }
}

export function getWeekRange(now: Date): PomodoroStatsRange {
  const today = startOfLocalDay(now)
  const day = today.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1
  const start = addDays(today, -daysSinceMonday)
  const end = addDays(start, 7)

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  }
}

export function getPomodoroSummary({
  rows,
  now,
}: {
  rows: PomodoroStatsRow[]
  now: Date
}): PomodoroSummary {
  const todayRange = getTodayRange(now)
  const todayRows = rows.filter((row) => {
    if (!row.completedAt) {
      return false
    }

    return row.completedAt >= todayRange.from && row.completedAt < todayRange.to
  })

  return {
    sessionsToday: todayRows.length,
    studyMinutesToday: todayRows.reduce(
      (total, row) => total + row.actualMinutes,
      0,
    ),
    studyMinutesThisWeek: rows.reduce(
      (total, row) => total + row.actualMinutes,
      0,
    ),
  }
}

export function formatPomodoroMode(value: PomodoroMode) {
  return pomodoroModeLabels[value]
}
