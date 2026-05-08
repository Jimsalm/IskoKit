import { createPomodoroSessionSchema } from "@/features/pomodoro/schemas"
import type {
  CreatePomodoroSessionValues,
  PomodoroMode,
  PomodoroSession,
  PomodoroSessionRow,
  PomodoroStatsRange,
  PomodoroStatsRow,
  PomodoroStatus,
} from "@/features/pomodoro/types"
import { pomodoroModes, pomodoroStatuses } from "@/features/pomodoro/types"
import { AppError, getUserErrorMessage, throwAppError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/client"

const pomodoroSessionSelect =
  "id,user_id,subject,task_label,mode,duration_minutes,actual_minutes,status,started_at,completed_at,created_at"

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
    userId: row.user_id,
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

function toStatsRow(row: {
  actual_minutes: number
  completed_at: string | null
}): PomodoroStatsRow {
  return {
    actualMinutes: row.actual_minutes,
    completedAt: row.completed_at,
  }
}

function toCompletedFocusPayload(values: CreatePomodoroSessionValues) {
  const parsed = createPomodoroSessionSchema.parse(values)

  return {
    subject: parsed.subject ?? null,
    task_label: parsed.taskLabel ?? null,
    mode: "focus",
    duration_minutes: parsed.durationMinutes,
    actual_minutes: parsed.actualMinutes,
    status: "completed",
    started_at: parsed.startedAt,
    completed_at: parsed.completedAt,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throwAppError(
      error,
      pomodoroErrorOptions("Could not verify your session. Please sign in again."),
    )
  }

  if (!data.user) {
    throw new AppError("You must be signed in to manage Pomodoro sessions.", {
      code: "AUTH_REQUIRED",
    })
  }

  return data.user.id
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

export async function createCompletedFocusSession(
  values: CreatePomodoroSessionValues,
) {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const payload = toCompletedFocusPayload(values)
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({
      ...payload,
      user_id: userId,
    })
    .select(pomodoroSessionSelect)
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

export function pomodoroMutationError(error: unknown) {
  return getUserErrorMessage(
    error,
    "Something went wrong with Pomodoro sessions. Please try again.",
  )
}
