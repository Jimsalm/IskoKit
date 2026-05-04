import { z } from "zod"

import { noteSources } from "@/features/notes/types"

export const noteFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Keep the title under 120 characters."),
  content: z
    .string()
    .trim()
    .min(1, "Content is required.")
    .max(20000, "Keep the note under 20,000 characters."),
  subject: z
    .string()
    .trim()
    .max(80, "Keep the subject under 80 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tags cannot be empty.")
        .max(32, "Keep each tag under 32 characters."),
    )
    .max(12, "Use up to 12 tags.")
    .default([]),
  isPinned: z.boolean().default(false),
  source: z.enum(noteSources).default("manual"),
})

export type NoteFormSchema = z.infer<typeof noteFormSchema>

export function parseTagsText(value: string) {
  const uniqueTags = new Map<string, string>()

  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => {
      const key = tag.toLowerCase()

      if (!uniqueTags.has(key)) {
        uniqueTags.set(key, tag)
      }
    })

  return Array.from(uniqueTags.values())
}
