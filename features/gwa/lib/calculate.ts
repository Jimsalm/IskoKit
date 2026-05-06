import { numericGwaGrades } from "@/features/gwa/types"
import type {
  GwaCalculatedSubject,
  GwaCalculationResult,
  GwaCalculationValues,
  GwaGrade,
} from "@/features/gwa/types"

const numericGradeSet = new Set<GwaGrade>(numericGwaGrades)

function roundToTwo(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function isNumericGwaGrade(grade: GwaGrade) {
  return numericGradeSet.has(grade)
}

export function getGwaRemarks(gwa: number) {
  if (gwa <= 1.5) {
    return "Excellent"
  }

  if (gwa <= 2) {
    return "Very good"
  }

  if (gwa <= 2.75) {
    return "Good standing"
  }

  if (gwa <= 3) {
    return "Passing"
  }

  return "Needs support"
}

export function formatGwaValue(value: number) {
  return value.toFixed(2)
}

export function formatUnitsValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function calculateGwa(values: GwaCalculationValues): GwaCalculationResult {
  if (!values.subjects.length) {
    throw new Error("Add at least one subject before calculating.")
  }

  const subjects: GwaCalculatedSubject[] = values.subjects.map((subject) => {
    const isIncluded = isNumericGwaGrade(subject.grade)
    const weightedGrade = isIncluded ? Number(subject.grade) * subject.units : null

    return {
      ...subject,
      isIncluded,
      weightedGrade,
    }
  })
  const includedSubjects = subjects.filter((subject) => subject.isIncluded)
  const totalUnits = includedSubjects.reduce(
    (total, subject) => total + subject.units,
    0,
  )

  if (!includedSubjects.length || totalUnits <= 0) {
    throw new Error("At least one subject must have a numeric grade.")
  }

  const totalWeightedGrades = includedSubjects.reduce(
    (total, subject) => total + (subject.weightedGrade ?? 0),
    0,
  )
  const gwa = roundToTwo(totalWeightedGrades / totalUnits)

  return {
    semester: values.semester,
    schoolYear: values.schoolYear,
    gwa,
    totalUnits: roundToTwo(totalUnits),
    totalSubjects: includedSubjects.length,
    subjects,
    remarks: getGwaRemarks(gwa),
  }
}
