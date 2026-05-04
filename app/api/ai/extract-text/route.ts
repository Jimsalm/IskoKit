import { NextResponse } from "next/server"

import { extractReadableText } from "@/features/ai-summarizer/lib/extract-text"
import { validateSummaryFile } from "@/features/ai-summarizer/lib/file-validation"
import { sourceTextPreviewLength } from "@/features/ai-summarizer/schemas"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function getReadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (/password/i.test(message)) {
    return "This PDF is password-protected. Upload an unlocked PDF."
  }

  if (/invalid|corrupt|damaged/i.test(message)) {
    return "This PDF could not be read. It may be corrupted or unsupported."
  }

  return "Could not read text from this file."
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    return jsonError("You must be signed in to extract files.", 401)
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return jsonError("Choose a file to summarize.")
  }

  const validationError = validateSummaryFile(file)

  if (validationError) {
    return jsonError(validationError)
  }

  try {
    const text = await extractReadableText(file)

    if (!text) {
      return jsonError("No readable text was found in this file.")
    }

    return NextResponse.json({
      text,
      preview: text.slice(0, sourceTextPreviewLength),
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    return jsonError(getReadErrorMessage(error), 422)
  }
}
