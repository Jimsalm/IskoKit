import { z } from "zod"

export const pdfToolIds = [
  "merge_pdf",
  "split_pdf",
  "image_to_pdf",
  "pdf_to_image",
  "compress_pdf",
  "word_to_pdf",
  "pdf_to_word",
  "edit_pdf",
  "pdf_annotator",
  "sign_pdf",
] as const

export const maxPdfToolFileSizeBytes = 5 * 1024 * 1024
export const maxPdfToolFiles = 10

export const createFileActivitySchema = z.object({
  toolUsed: z.enum(pdfToolIds),
  inputFileNames: z.array(z.string().trim().min(1).max(255)).min(1).max(10),
  outputFileName: z.string().trim().max(255).nullable(),
  fileCount: z.number().int().min(1).max(maxPdfToolFiles),
  originalSize: z.number().int().nonnegative(),
  outputSize: z.number().int().nonnegative().nullable(),
})
