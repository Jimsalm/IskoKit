import { createFileActivitySchema, pdfToolIds } from "@/features/pdf-tools/schemas"
import type {
  CreateFileActivityValues,
  FileActivity,
  FileActivityRow,
  PdfToolId,
} from "@/features/pdf-tools/types"
import { AppError, getUserErrorMessage, throwAppError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/client"

const fileActivitiesSelect =
  "id,tool_used,input_file_names,output_file_name,file_count,original_size,output_size,created_at"

const fileActivityErrorMessages = {
  permissionMessage:
    "You do not have permission to manage file activity. Please sign in again.",
  setupMessage:
    "PDF Tools activity is not set up yet. Please run the database migration.",
  networkMessage:
    "Could not reach the database. Check your connection and try again.",
}

function fileActivityErrorOptions(fallbackMessage: string) {
  return {
    ...fileActivityErrorMessages,
    fallbackMessage,
  }
}

function toPdfToolId(value: string): PdfToolId {
  return pdfToolIds.includes(value as PdfToolId)
    ? (value as PdfToolId)
    : "merge_pdf"
}

function toFileActivity(row: FileActivityRow): FileActivity {
  return {
    id: row.id,
    toolUsed: toPdfToolId(row.tool_used),
    inputFileNames: row.input_file_names,
    outputFileName: row.output_file_name,
    fileCount: row.file_count,
    originalSize: row.original_size,
    outputSize: row.output_size,
    createdAt: row.created_at,
  }
}

function toFileActivityPayload(values: CreateFileActivityValues) {
  const parsed = createFileActivitySchema.parse(values)

  return {
    tool_used: parsed.toolUsed,
    input_file_names: parsed.inputFileNames,
    output_file_name: parsed.outputFileName,
    file_count: parsed.fileCount,
    original_size: parsed.originalSize,
    output_size: parsed.outputSize,
  }
}

async function getCurrentUserId() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throwAppError(
      error,
      fileActivityErrorOptions(
        "Could not verify your session. Please sign in again.",
      ),
    )
  }

  if (!data.user) {
    throw new AppError("You must be signed in to use PDF Tools.", {
      code: "AUTH_REQUIRED",
    })
  }

  return data.user.id
}

export async function listFileActivities(): Promise<FileActivity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("file_activities")
    .select(fileActivitiesSelect)
    .order("created_at", { ascending: false })
    .limit(8)

  if (error) {
    throwAppError(
      error,
      fileActivityErrorOptions(
        "Could not load recent PDF activity. Please try again.",
      ),
    )
  }

  return ((data ?? []) as FileActivityRow[]).map(toFileActivity)
}

export async function createFileActivity(
  values: CreateFileActivityValues,
): Promise<FileActivity> {
  const supabase = createClient()
  const userId = await getCurrentUserId()
  const payload = toFileActivityPayload(values)
  const { data, error } = await supabase
    .from("file_activities")
    .insert({
      ...payload,
      user_id: userId,
    })
    .select(fileActivitiesSelect)
    .single()

  if (error) {
    throwAppError(
      error,
      fileActivityErrorOptions(
        "Could not save PDF activity. Your file output is still ready.",
      ),
    )
  }

  return toFileActivity(data as FileActivityRow)
}

export function pdfToolMutationError(error: unknown) {
  return getUserErrorMessage(
    error,
    "Something went wrong with PDF Tools. Please try again.",
  )
}
