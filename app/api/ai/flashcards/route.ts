import OpenAI from "openai"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getFlashcardInstructions } from "@/features/flashcards/lib/prompts"
import {
  generatedFlashcardsResponseSchema,
  generateFlashcardsRequestSchema,
} from "@/features/flashcards/schemas"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const flashcardsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["flashcards"],
  properties: {
    flashcards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer", "difficulty", "type"],
        properties: {
          question: {
            type: "string",
          },
          answer: {
            type: "string",
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
          },
          type: {
            type: "string",
            enum: ["qa", "definition", "exam_prep", "concept_check"],
          },
        },
      },
    },
  },
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function getZodMessage(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid flashcard request."
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims?.sub) {
    return jsonError("You must be signed in to generate flashcards.", 401)
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonError("OpenAI API key is not configured.", 500)
  }

  try {
    const payload = generateFlashcardsRequestSchema.parse(await request.json())
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    const response = await openai.responses.create({
      model: process.env.OPENAI_FLASHCARD_MODEL ?? "gpt-5.4-nano",
      instructions: getFlashcardInstructions(payload),
      input: payload.content,
      text: {
        format: {
          type: "json_schema",
          name: "flashcards",
          strict: true,
          schema: flashcardsJsonSchema,
        },
      },
    })
    const rawFlashcards = response.output_text.trim()

    if (!rawFlashcards) {
      return jsonError("The AI did not return flashcards.", 502)
    }

    let parsedJson: unknown

    try {
      parsedJson = JSON.parse(rawFlashcards)
    } catch {
      return jsonError("The AI response could not be parsed.", 502)
    }

    const parsed = generatedFlashcardsResponseSchema.safeParse(parsedJson)

    if (!parsed.success) {
      return jsonError("The AI response could not be parsed.", 502)
    }

    return NextResponse.json({
      flashcards: parsed.data.flashcards.map((flashcard) => ({
        ...flashcard,
        difficulty: payload.difficulty,
        type: payload.cardType,
      })),
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(getZodMessage(error))
    }

    return jsonError("The flashcard request failed. Please try again.", 502)
  }
}
