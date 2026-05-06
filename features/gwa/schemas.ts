import { z } from "zod"

import { gwaGrades } from "@/features/gwa/types"

function optionalTrimmedString(maxLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maxLength, message)
    .optional()
    .transform((value) => (value ? value : undefined))
}

const unitsSchema = z
  .union([z.string(), z.number()])
  .transform((value, context) => {
    const rawValue = typeof value === "number" ? String(value) : value.trim()

    if (!rawValue) {
      context.addIssue({
        code: "custom",
        message: "Units are required.",
      })
      return z.NEVER
    }

    const units = Number(rawValue)

    if (!Number.isFinite(units)) {
      context.addIssue({
        code: "custom",
        message: "Units must be a number.",
      })
      return z.NEVER
    }

    if (units <= 0) {
      context.addIssue({
        code: "custom",
        message: "Units must be greater than 0.",
      })
      return z.NEVER
    }

    if (units > 99) {
      context.addIssue({
        code: "custom",
        message: "Keep units under 100.",
      })
      return z.NEVER
    }

    return units
  })

export const gwaGradeSchema = z
  .string()
  .trim()
  .min(1, "Grade is required.")
  .refine(
    (value) => gwaGrades.includes(value as (typeof gwaGrades)[number]),
    "Choose a valid grade.",
  )
  .transform((value) => value as (typeof gwaGrades)[number])

export const gwaSubjectSchema = z.object({
  subjectName: z
    .string()
    .trim()
    .min(1, "Subject name is required.")
    .max(160, "Keep the subject name under 160 characters."),
  subjectCode: optionalTrimmedString(
    40,
    "Keep the subject code under 40 characters.",
  ),
  units: unitsSchema,
  grade: gwaGradeSchema,
})

export const gwaCalculationSchema = z.object({
  semester: z
    .string()
    .trim()
    .min(1, "Semester is required.")
    .max(80, "Keep the semester under 80 characters."),
  schoolYear: z
    .string()
    .trim()
    .min(1, "School year is required.")
    .max(40, "Keep the school year under 40 characters."),
  subjects: z.array(gwaSubjectSchema).min(1, "Add at least one subject."),
})

export const saveGwaSubjectSchema = gwaSubjectSchema.extend({
  isIncluded: z.boolean(),
})

export const saveGwaRecordSchema = z.object({
  semester: z
    .string()
    .trim()
    .min(1, "Semester is required.")
    .max(80, "Keep the semester under 80 characters."),
  schoolYear: z
    .string()
    .trim()
    .min(1, "School year is required.")
    .max(40, "Keep the school year under 40 characters."),
  gwa: z.number().min(1).max(5),
  totalUnits: z.number().positive(),
  totalSubjects: z.number().int().positive(),
  subjects: z
    .array(saveGwaSubjectSchema)
    .min(1, "Save at least one subject breakdown."),
})

export type GwaSubjectSchema = z.infer<typeof gwaSubjectSchema>

export type GwaCalculationSchema = z.infer<typeof gwaCalculationSchema>

export type SaveGwaRecordSchema = z.infer<typeof saveGwaRecordSchema>
