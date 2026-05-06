import { saveGwaRecordSchema } from "@/features/gwa/schemas"
import type {
  GwaGrade,
  GwaRecord,
  GwaRecordRow,
  GwaRecordSummary,
  GwaRecordWithSubjectsRow,
  GwaSubject,
  GwaSubjectRow,
  SaveGwaRecordValues,
  UpdateGwaRecordValues,
} from "@/features/gwa/types"
import { gwaGrades } from "@/features/gwa/types"
import { AppError, getUserErrorMessage, throwAppError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/client"

const recordSelect =
  "id,semester,school_year,gwa,total_units,total_subjects,created_at,updated_at"

const subjectSelect =
  "id,gwa_record_id,subject_name,subject_code,units,grade,is_included,created_at"

const recordWithSubjectsSelect = `${recordSelect},gwa_subjects(${subjectSelect})`

const gwaErrorMessages = {
  permissionMessage:
    "You do not have permission to manage GWA records. Please sign in again.",
  setupMessage:
    "GWA Calculator is not set up yet. Please run the GWA database migration.",
  networkMessage:
    "Could not reach the database. Check your connection and try again.",
}

function gwaErrorOptions(fallbackMessage: string) {
  return {
    ...gwaErrorMessages,
    fallbackMessage,
  }
}

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value)
}

function toGrade(value: GwaGrade) {
  return gwaGrades.includes(value) ? value : "5.00"
}

function toSubject(row: GwaSubjectRow): GwaSubject {
  return {
    id: row.id,
    recordId: row.gwa_record_id,
    subjectName: row.subject_name,
    subjectCode: row.subject_code,
    units: toNumber(row.units),
    grade: toGrade(row.grade),
    isIncluded: row.is_included,
    createdAt: row.created_at,
  }
}

function toRecordSummary(row: GwaRecordRow): GwaRecordSummary {
  return {
    id: row.id,
    semester: row.semester,
    schoolYear: row.school_year,
    gwa: toNumber(row.gwa),
    totalUnits: toNumber(row.total_units),
    totalSubjects: row.total_subjects,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRecord(row: GwaRecordWithSubjectsRow): GwaRecord {
  const subjects = [...(row.gwa_subjects ?? [])]
    .sort((first, second) => first.created_at.localeCompare(second.created_at))
    .map(toSubject)

  return {
    ...toRecordSummary(row),
    subjects,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throwAppError(
      error,
      gwaErrorOptions("Could not verify your session. Please sign in again."),
    )
  }

  if (!data.user) {
    throw new AppError("You must be signed in to manage GWA records.", {
      code: "AUTH_REQUIRED",
    })
  }

  return data.user.id
}

export async function listGwaRecords(): Promise<GwaRecordSummary[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("gwa_records")
    .select(recordSelect)
    .order("created_at", { ascending: false })

  if (error) {
    throwAppError(
      error,
      gwaErrorOptions("Could not load GWA history. Please try again."),
    )
  }

  return ((data ?? []) as GwaRecordRow[]).map(toRecordSummary)
}

export async function getGwaRecord(id: string): Promise<GwaRecord> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("gwa_records")
    .select(recordWithSubjectsSelect)
    .eq("id", id)
    .single()

  if (error) {
    throwAppError(
      error,
      gwaErrorOptions("Could not load GWA record details. Please try again."),
    )
  }

  return toRecord(data as GwaRecordWithSubjectsRow)
}

export async function createGwaRecord(
  values: SaveGwaRecordValues,
): Promise<GwaRecord> {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const parsed = saveGwaRecordSchema.parse(values)
  const { data: recordData, error: recordError } = await supabase
    .from("gwa_records")
    .insert({
      user_id: userId,
      semester: parsed.semester,
      school_year: parsed.schoolYear,
      gwa: parsed.gwa,
      total_units: parsed.totalUnits,
      total_subjects: parsed.totalSubjects,
    })
    .select(recordSelect)
    .single()

  if (recordError) {
    throwAppError(
      recordError,
      gwaErrorOptions("Could not save GWA record. Please try again."),
    )
  }

  const record = recordData as GwaRecordRow
  const subjectRows = parsed.subjects.map((subject) => ({
    gwa_record_id: record.id,
    subject_name: subject.subjectName,
    subject_code: subject.subjectCode ?? null,
    units: subject.units,
    grade: subject.grade,
    is_included: subject.isIncluded,
  }))
  const { data: subjectsData, error: subjectsError } = await supabase
    .from("gwa_subjects")
    .insert(subjectRows)
    .select(subjectSelect)

  if (subjectsError) {
    await supabase.from("gwa_records").delete().eq("id", record.id)
    throwAppError(
      subjectsError,
      gwaErrorOptions("Could not save subject breakdown. Please try again."),
    )
  }

  return toRecord({
    ...record,
    gwa_subjects: (subjectsData ?? []) as GwaSubjectRow[],
  })
}

export async function updateGwaRecord({
  id,
  values,
}: UpdateGwaRecordValues): Promise<GwaRecord> {
  const supabase = createClient()
  const parsed = saveGwaRecordSchema.parse(values)
  const { data: recordData, error: recordError } = await supabase
    .from("gwa_records")
    .update({
      semester: parsed.semester,
      school_year: parsed.schoolYear,
      gwa: parsed.gwa,
      total_units: parsed.totalUnits,
      total_subjects: parsed.totalSubjects,
    })
    .eq("id", id)
    .select(recordSelect)
    .single()

  if (recordError) {
    throwAppError(
      recordError,
      gwaErrorOptions("Could not update GWA record. Please try again."),
    )
  }

  const { error: deleteError } = await supabase
    .from("gwa_subjects")
    .delete()
    .eq("gwa_record_id", id)

  if (deleteError) {
    throwAppError(
      deleteError,
      gwaErrorOptions("Could not update subject breakdown. Please try again."),
    )
  }

  const subjectRows = parsed.subjects.map((subject) => ({
    gwa_record_id: id,
    subject_name: subject.subjectName,
    subject_code: subject.subjectCode ?? null,
    units: subject.units,
    grade: subject.grade,
    is_included: subject.isIncluded,
  }))
  const { data: subjectsData, error: subjectsError } = await supabase
    .from("gwa_subjects")
    .insert(subjectRows)
    .select(subjectSelect)

  if (subjectsError) {
    throwAppError(
      subjectsError,
      gwaErrorOptions("Could not save updated subject breakdown. Please try again."),
    )
  }

  return toRecord({
    ...(recordData as GwaRecordRow),
    gwa_subjects: (subjectsData ?? []) as GwaSubjectRow[],
  })
}

export async function deleteGwaRecord(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("gwa_records").delete().eq("id", id)

  if (error) {
    throwAppError(
      error,
      gwaErrorOptions("Could not delete GWA record. Please try again."),
    )
  }
}

export function gwaMutationError(error: unknown) {
  return getUserErrorMessage(
    error,
    "Something went wrong with GWA records. Please try again.",
  )
}
