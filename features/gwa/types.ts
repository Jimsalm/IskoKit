export const numericGwaGrades = [
  "1.00",
  "1.25",
  "1.50",
  "1.75",
  "2.00",
  "2.25",
  "2.50",
  "2.75",
  "3.00",
  "4.00",
  "5.00",
] as const

export const nonNumericGwaGrades = ["INC", "DRP", "NFE", "P", "F"] as const

export const gwaGrades = [...numericGwaGrades, ...nonNumericGwaGrades] as const

export type NumericGwaGrade = (typeof numericGwaGrades)[number]

export type NonNumericGwaGrade = (typeof nonNumericGwaGrades)[number]

export type GwaGrade = (typeof gwaGrades)[number]

export type GwaSubjectDraft = {
  rowId: string
  subjectName: string
  subjectCode: string
  units: string
  grade: GwaGrade | ""
}

export type GwaSubjectDraftErrors = Partial<
  Record<"subjectName" | "subjectCode" | "units" | "grade", string>
>

export type GwaCalculationSubject = {
  subjectName: string
  subjectCode?: string
  units: number
  grade: GwaGrade
}

export type GwaCalculationValues = {
  semester: string
  schoolYear: string
  subjects: GwaCalculationSubject[]
}

export type GwaCalculatedSubject = GwaCalculationSubject & {
  isIncluded: boolean
  weightedGrade: number | null
}

export type GwaCalculationResult = {
  semester: string
  schoolYear: string
  gwa: number
  totalUnits: number
  totalSubjects: number
  subjects: GwaCalculatedSubject[]
  remarks: string
}

export type SaveGwaSubjectValues = {
  subjectName: string
  subjectCode?: string
  units: number
  grade: GwaGrade
  isIncluded: boolean
}

export type SaveGwaRecordValues = {
  semester: string
  schoolYear: string
  gwa: number
  totalUnits: number
  totalSubjects: number
  subjects: SaveGwaSubjectValues[]
}

export type UpdateGwaRecordValues = {
  id: string
  values: SaveGwaRecordValues
}

export type GwaRecordSummary = {
  id: string
  semester: string
  schoolYear: string
  gwa: number
  totalUnits: number
  totalSubjects: number
  createdAt: string
  updatedAt: string
}

export type GwaRecord = GwaRecordSummary & {
  subjects: GwaSubject[]
}

export type GwaSubject = {
  id: string
  recordId: string
  subjectName: string
  subjectCode: string | null
  units: number
  grade: GwaGrade
  isIncluded: boolean
  createdAt: string
}

export type GwaRecordRow = {
  id: string
  semester: string
  school_year: string
  gwa: number | string
  total_units: number | string
  total_subjects: number
  created_at: string
  updated_at: string
}

export type GwaSubjectRow = {
  id: string
  gwa_record_id: string
  subject_name: string
  subject_code: string | null
  units: number | string
  grade: GwaGrade
  is_included: boolean
  created_at: string
}

export type GwaRecordWithSubjectsRow = GwaRecordRow & {
  gwa_subjects?: GwaSubjectRow[]
}
