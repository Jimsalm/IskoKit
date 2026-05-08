import { z } from "zod"

import { pomodoroModes, pomodoroStatuses } from "@/features/pomodoro/types"

export const pomodoroModeLabels = {
  focus: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
} as const

export const pomodoroStatusLabels = {
  completed: "Completed",
  cancelled: "Cancelled",
} as const

export const pomodoroModeDurations = {
  focus: 25,
  short_break: 5,
  long_break: 15,
} as const

function isValidDateTime(value: string) {
  return !Number.isNaN(new Date(value).getTime())
}

export const createPomodoroSessionSchema = z.object({
  subject: z
    .string()
    .trim()
    .max(80, "Keep the subject under 80 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  taskLabel: z
    .string()
    .trim()
    .max(120, "Keep the task label under 120 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  durationMinutes: z
    .number()
    .int("Duration must be a whole number.")
    .min(1, "Duration must be at least 1 minute.")
    .max(180, "Duration must stay under 180 minutes."),
  actualMinutes: z
    .number()
    .int("Actual minutes must be a whole number.")
    .min(1, "Actual minutes must be at least 1 minute.")
    .max(180, "Actual minutes must stay under 180 minutes."),
  startedAt: z
    .string()
    .trim()
    .refine(isValidDateTime, "Choose a valid start time."),
  completedAt: z
    .string()
    .trim()
    .refine(isValidDateTime, "Choose a valid completion time."),
})

export const pomodoroSessionModeSchema = z.enum(pomodoroModes)

export const pomodoroSessionStatusSchema = z.enum(pomodoroStatuses)
