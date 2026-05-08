import {
  pomodoroSessionIdSchema,
  startPomodoroSessionSchema,
} from "@/features/pomodoro/schemas"
import type {
  PomodoroActiveSession,
  PomodoroActiveSessionRow,
  PomodoroMode,
  PomodoroSession,
  PomodoroSessionRow,
  PomodoroStatsRange,
  PomodoroStatsRow,
  PomodoroStatus,
  StartPomodoroSessionValues,
} from "@/features/pomodoro/types"
import { pomodoroModes, pomodoroStatuses } from "@/features/pomodoro/types"
import { getUserErrorMessage, throwAppError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/client"

const pomodoroSessionSelect =
  "id,subject,task_label,mode,duration_minutes,actual_minutes,status,started_at,completed_at,created_at"

const pomodoroStatsSelect = "actual_minutes,completed_at"

const pomodoroErrorMessages = {
  permissionMessage:
    "You do not have permission to manage Pomodoro sessions. Please sign in again.",
  setupMessage:
    "Pomodoro Timer is not set up yet. Please run the Pomodoro database migration.",
  networkMessage:
    "Could not reach the database. Check your connection and try again.",
}

function pomodoroErrorOptions(fallbackMessage: string) {
  return {
    ...pomodoroErrorMessages,
    fallbackMessage,
  }
}

function toPomodoroMode(value: string): PomodoroMode {
  return pomodoroModes.includes(value as PomodoroMode)
    ? (value as PomodoroMode)
    : "focus"
}

function toPomodoroStatus(value: string): PomodoroStatus {
  return pomodoroStatuses.includes(value as PomodoroStatus)
    ? (value as PomodoroStatus)
    : "completed"
}

function toSession(row: PomodoroSessionRow): PomodoroSession {
  return {
    id: row.id,
    subject: row.subject,
    taskLabel: row.task_label,
    mode: toPomodoroMode(row.mode),
    durationMinutes: row.duration_minutes,
    actualMinutes: row.actual_minutes,
    status: toPomodoroStatus(row.status),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }
}

function toActiveSession(row: PomodoroActiveSessionRow): PomodoroActiveSession {
  return {
    id: row.id,
    subject: row.subject,
    taskLabel: row.task_label,
    mode: toPomodoroMode(row.mode),
    durationMinutes: row.duration_minutes,
    startedAt: row.started_at,
  }
}

function toStatsRow(row: {
  actual_minutes: number
  completed_at: string | null
}): PomodoroStatsRow {
  return {
    actualMinutes: row.actual_minutes,
    completedAt: row.completed_at,
  }
}

function toStartPomodoroSessionParams(values: StartPomodoroSessionValues) {
  const parsed = startPomodoroSessionSchema.parse(values)

  return {
    p_subject: parsed.subject ?? null,
    p_task_label: parsed.taskLabel ?? null,
  }
}

export async function listRecentPomodoroSessions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select(pomodoroSessionSelect)
    .eq("mode", "focus")
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(10)

  if (error) {
    throwAppError(
      error,
      pomodoroErrorOptions(
        "Could not load Pomodoro session history. Please try again.",
      ),
    )
  }

  return ((data ?? []) as PomodoroSessionRow[]).map(toSession)
}

export async function listPomodoroStatsRows({
  from,
  to,
}: PomodoroStatsRange): Promise<PomodoroStatsRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select(pomodoroStatsSelect)
    .eq("mode", "focus")
    .eq("status", "completed")
    .gte("completed_at", from)
    .lt("completed_at", to)

  if (error) {
    throwAppError(
      error,
      pomodoroErrorOptions("Could not load Pomodoro stats. Please try again."),
    )
  }

  return (
    (data ?? []) as Array<{
      actual_minutes: number
      completed_at: string | null
    }>
  ).map(toStatsRow)
}

export async function startPomodoroFocusSession(
  values: StartPomodoroSessionValues,
) {
  const supabase = createClient()
  const params = toStartPomodoroSessionParams(values)
  const { data, error } = await supabase
    .rpc("start_pomodoro_session", params)
    .single()

  if (error) {
    throwAppError(
      error,
      pomodoroErrorOptions("Could not start focus session. Please try again."),
    )
  }

  return toActiveSession(data as PomodoroActiveSessionRow)
}

export async function completePomodoroFocusSession(sessionId: string) {
  const supabase = createClient()
  const parsedSessionId = pomodoroSessionIdSchema.parse(sessionId)
  const { data, error } = await supabase
    .rpc("complete_pomodoro_session", {
      p_timer_id: parsedSessionId,
    })
    .single()

  if (error) {
    throwAppError(
      error,
      pomodoroErrorOptions(
        "Could not save completed focus session. Please try again.",
      ),
    )
  }

  return toSession(data as PomodoroSessionRow)
}

export async function cancelPomodoroFocusSession(sessionId: string) {
  const supabase = createClient()
  const parsedSessionId = pomodoroSessionIdSchema.parse(sessionId)
  const { error } = await supabase.rpc("cancel_pomodoro_session", {
    p_timer_id: parsedSessionId,
  })

  if (error) {
    throwAppError(
      error,
      pomodoroErrorOptions("Could not cancel focus session. Please try again."),
    )
  }
}

export function pomodoroMutationError(error: unknown) {
  return getUserErrorMessage(
    error,
    "Something went wrong with Pomodoro sessions. Please try again.",
  )
}
