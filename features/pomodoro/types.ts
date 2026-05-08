export const pomodoroModes = ["focus", "short_break", "long_break"] as const

export const pomodoroStatuses = ["completed", "cancelled"] as const

export type PomodoroMode = (typeof pomodoroModes)[number]

export type PomodoroStatus = (typeof pomodoroStatuses)[number]

export type PomodoroSessionRow = {
  id: string
  user_id: string
  subject: string | null
  task_label: string | null
  mode: string
  duration_minutes: number
  actual_minutes: number
  status: string
  started_at: string
  completed_at: string | null
  created_at: string
}

export type PomodoroSession = {
  id: string
  userId: string
  subject: string | null
  taskLabel: string | null
  mode: PomodoroMode
  durationMinutes: number
  actualMinutes: number
  status: PomodoroStatus
  startedAt: string
  completedAt: string | null
  createdAt: string
}

export type PomodoroStatsRow = Pick<
  PomodoroSession,
  "actualMinutes" | "completedAt"
>

export type PomodoroSummary = {
  sessionsToday: number
  studyMinutesToday: number
  studyMinutesThisWeek: number
}

export type PomodoroStatsRange = {
  from: string
  to: string
}

export type CreatePomodoroSessionValues = {
  subject?: string
  taskLabel?: string
  durationMinutes: number
  actualMinutes: number
  startedAt: string
  completedAt: string
}

export type PomodoroTimerStatus = "idle" | "running" | "paused" | "completed"

export type PomodoroTimerCompletion = CreatePomodoroSessionValues & {
  mode: PomodoroMode
}
