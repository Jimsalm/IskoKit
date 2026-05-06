import { assignmentFormSchema } from "@/features/assignments/schemas"
import type {
  Assignment,
  AssignmentFormValues,
  AssignmentPriority,
  AssignmentRow,
  AssignmentStatsRow,
  AssignmentStatus,
  AssignmentType,
} from "@/features/assignments/types"
import {
  assignmentPriorities,
  assignmentStatuses,
  assignmentTypes,
} from "@/features/assignments/types"
import { AppError, getUserErrorMessage, throwAppError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/client"

const assignmentsSelect =
  "id,user_id,subject,title,description,due_date,due_time,priority,status,type,completed_at,created_at,updated_at"

const assignmentStatsSelect = "status,due_date,due_time"

const assignmentErrorMessages = {
  permissionMessage:
    "You do not have permission to manage this assignment. Please sign in again.",
  setupMessage:
    "Assignments are not set up yet. Please run the assignments database migration.",
  networkMessage:
    "Could not reach the database. Check your connection and try again.",
}

function assignmentErrorOptions(fallbackMessage: string) {
  return {
    ...assignmentErrorMessages,
    fallbackMessage,
  }
}

function toAssignment(row: AssignmentRow): Assignment {
  const priority = assignmentPriorities.includes(row.priority)
    ? row.priority
    : "medium"
  const status = assignmentStatuses.includes(row.status)
    ? row.status
    : "pending"
  const assignmentType = assignmentTypes.includes(row.type)
    ? row.type
    : "homework"

  return {
    id: row.id,
    userId: row.user_id,
    subject: row.subject,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    dueTime: row.due_time,
    priority,
    status,
    assignmentType,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toAssignmentPayload(values: AssignmentFormValues) {
  const parsed = assignmentFormSchema.parse(values)

  return {
    title: parsed.title,
    description: parsed.description ?? null,
    subject: parsed.subject ?? null,
    due_date: parsed.dueDate,
    due_time: parsed.dueTime ?? null,
    priority: parsed.priority,
    status: parsed.status,
    type: parsed.assignmentType,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions(
        "Could not verify your session. Please sign in again.",
      ),
    )
  }

  if (!data.user) {
    throw new AppError("You must be signed in to manage assignments.", {
      code: "AUTH_REQUIRED",
    })
  }

  return data.user.id
}

async function getAssignmentCompletion(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("assignments")
    .select("status,completed_at")
    .eq("id", id)
    .single()

  if (error) {
    throwAppError(error, assignmentErrorOptions("Could not load the assignment."))
  }

  return data as {
    status: AssignmentStatus
    completed_at: string | null
  }
}

function getCompletedAtForStatus({
  nextStatus,
  currentCompletedAt,
}: {
  nextStatus: AssignmentStatus
  currentCompletedAt?: string | null
}) {
  if (nextStatus !== "completed") {
    return null
  }

  return currentCompletedAt ?? new Date().toISOString()
}

export async function listAssignments(): Promise<Assignment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("assignments")
    .select(assignmentsSelect)
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions("Could not load assignments. Please try again."),
    )
  }

  return ((data ?? []) as AssignmentRow[]).map(toAssignment)
}

export async function listAssignmentStats(): Promise<AssignmentStatsRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("assignments")
    .select(assignmentStatsSelect)

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions(
        "Could not load assignment stats. Please try again.",
      ),
    )
  }

  return (data ?? []) as AssignmentStatsRow[]
}

export async function createAssignment(
  values: AssignmentFormValues,
): Promise<Assignment> {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const payload = toAssignmentPayload(values)
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      ...payload,
      user_id: userId,
      completed_at: getCompletedAtForStatus({
        nextStatus: payload.status,
      }),
    })
    .select(assignmentsSelect)
    .single()

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions("Could not create assignment. Please try again."),
    )
  }

  return toAssignment(data as AssignmentRow)
}

export async function updateAssignment({
  id,
  values,
}: {
  id: string
  values: AssignmentFormValues
}): Promise<Assignment> {
  const supabase = createClient()
  const payload = toAssignmentPayload(values)
  const current = await getAssignmentCompletion(id)
  const { data, error } = await supabase
    .from("assignments")
    .update({
      ...payload,
      completed_at: getCompletedAtForStatus({
        nextStatus: payload.status,
        currentCompletedAt: current.completed_at,
      }),
    })
    .eq("id", id)
    .select(assignmentsSelect)
    .single()

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions("Could not update assignment. Please try again."),
    )
  }

  return toAssignment(data as AssignmentRow)
}

export async function setAssignmentCompleted({
  id,
  completed,
}: {
  id: string
  completed: boolean
}): Promise<Assignment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("assignments")
    .update({
      status: completed ? "completed" : "pending",
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select(assignmentsSelect)
    .single()

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions("Could not update assignment. Please try again."),
    )
  }

  return toAssignment(data as AssignmentRow)
}

export async function deleteAssignment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("assignments").delete().eq("id", id)

  if (error) {
    throwAppError(
      error,
      assignmentErrorOptions("Could not delete assignment. Please try again."),
    )
  }
}

export function getAssignmentPriorityLabel(value: AssignmentPriority) {
  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  } satisfies Record<AssignmentPriority, string>

  return labels[value]
}

export function getAssignmentStatusLabel(value: AssignmentStatus) {
  const labels = {
    pending: "Pending",
    in_progress: "In progress",
    completed: "Completed",
  } satisfies Record<AssignmentStatus, string>

  return labels[value]
}

export function getAssignmentTypeLabel(value: AssignmentType) {
  const labels = {
    homework: "Homework",
    quiz: "Quiz",
    project: "Project",
    exam: "Exam",
    activity: "Activity",
    report: "Report",
    other: "Other",
  } satisfies Record<AssignmentType, string>

  return labels[value]
}

export function assignmentMutationError(error: unknown) {
  return getUserErrorMessage(
    error,
    "Something went wrong with assignments. Please try again.",
  )
}
