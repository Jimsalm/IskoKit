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
    mappings: [
      {
        code: "SETUP_REQUIRED" as const,
        matches: ["save_gwa_record", "delete_gwa_record"],
        message: gwaErrorMessages.setupMessage,
      },
    ],
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

async function saveGwaRecord({
  id,
  values,
  fallbackMessage,
}: {
  id: string | null
  values: SaveGwaRecordValues
  fallbackMessage: string
}) {
  const supabase = createClient()
  const parsed = saveGwaRecordSchema.parse(values)
  const { data: recordId, error } = await supabase.rpc("save_gwa_record", {
    p_record_id: id,
    p_school_year: parsed.schoolYear,
    p_semester: parsed.semester,
    p_subjects: parsed.subjects,
  })

  if (error) {
    throwAppError(error, gwaErrorOptions(fallbackMessage))
  }

  if (typeof recordId !== "string") {
    throw new AppError(fallbackMessage, { code: "UNKNOWN" })
  }

  return getGwaRecord(recordId)
}

export async function createGwaRecord(
  values: SaveGwaRecordValues,
): Promise<GwaRecord> {
  return saveGwaRecord({
    id: null,
    values,
    fallbackMessage: "Could not save GWA record. Please try again.",
  })
}

export async function updateGwaRecord({
  id,
  values,
}: UpdateGwaRecordValues): Promise<GwaRecord> {
  return saveGwaRecord({
    id,
    values,
    fallbackMessage: "Could not update GWA record. Please try again.",
  })
}

export async function deleteGwaRecord(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc("delete_gwa_record", {
    p_record_id: id,
  })

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
