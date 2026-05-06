import { z } from "zod"

import {
  assignmentPriorities,
  assignmentStatuses,
  assignmentTypes,
} from "@/features/assignments/types"

export const assignmentPriorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const

export const assignmentStatusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
} as const

export const assignmentTypeLabels = {
  homework: "Homework",
  quiz: "Quiz",
  project: "Project",
  exam: "Exam",
  activity: "Activity",
  report: "Report",
  other: "Other",
} as const

export const assignmentSortLabels = {
  nearest_due: "Nearest due date",
  newest: "Newest created",
  priority: "Priority",
  status: "Status",
} as const

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^\d{2}:\d{2}$/

function isValidDate(value: string) {
  if (!datePattern.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  const [year, month, day] = value.split("-").map(Number)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function isValidTime(value: string) {
  if (!timePattern.test(value)) {
    return false
  }

  const [hour, minute] = value.split(":").map(Number)

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
}

export const assignmentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1,000 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  subject: z
    .string()
    .trim()
    .max(80, "Keep the subject under 80 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  dueDate: z
    .string()
    .trim()
    .refine(isValidDate, "Choose a valid due date."),
  dueTime: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => !value || isValidTime(value), {
      message: "Choose a valid due time.",
    }),
  priority: z
    .enum(assignmentPriorities, { error: "Choose a valid priority." })
    .default("medium"),
  status: z
    .enum(assignmentStatuses, { error: "Choose a valid status." })
    .default("pending"),
  assignmentType: z
    .enum(assignmentTypes, { error: "Choose a valid assignment type." })
    .default("homework"),
})

export type AssignmentFormSchema = z.infer<typeof assignmentFormSchema>
