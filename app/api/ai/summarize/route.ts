import OpenAI from "openai"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getSummarizerInstructions } from "@/features/ai-summarizer/lib/prompts"
import { summarizeRequestSchema } from "@/features/ai-summarizer/schemas"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function getZodMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid summary request."
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    return jsonError("You must be signed in to generate summaries.", 401)
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonError("OpenAI API key is not configured.", 500)
  }

  try {
    const payload = summarizeRequestSchema.parse(await request.json())
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    const response = await openai.responses.create({
      model: process.env.OPENAI_SUMMARY_MODEL ?? "gpt-5.4-nano",
      instructions: getSummarizerInstructions(payload.summaryType),
      input: payload.content,
    })
    const summary = response.output_text.trim()

    if (!summary) {
      return jsonError("The AI did not return a readable summary.", 502)
    }

    return NextResponse.json({ summary })
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(getZodMessage(error))
    }

    return jsonError("The summary request failed. Please try again.", 502)
  }
}
