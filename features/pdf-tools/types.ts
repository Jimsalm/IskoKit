import type { LucideIcon } from "lucide-react"

export type PdfToolId =
  | "merge_pdf"
  | "split_pdf"
  | "image_to_pdf"
  | "pdf_to_image"
  | "compress_pdf"
  | "word_to_pdf"
  | "pdf_to_word"
  | "edit_pdf"
  | "pdf_annotator"
  | "sign_pdf"

export type PdfToolCategory = "Organize" | "Convert" | "Optimize" | "Edit"
export type PdfToolPhase = "basic" | "advanced"
export type PdfToolStatus = "ready" | "limited" | "experimental"

export type PdfToolConfig = {
  id: PdfToolId
  href: string
  isExternal?: boolean
  label: string
  description: string
  category: PdfToolCategory
  phase: PdfToolPhase
  status?: PdfToolStatus
  acceptedTypes: string
  actionLabel: string
  icon: LucideIcon
}

export type FileActivityRow = {
  id: string
  tool_used: string
  input_file_names: string[]
  output_file_name: string | null
  file_count: number
  original_size: number
  output_size: number | null
  created_at: string
}

export type FileActivity = {
  id: string
  toolUsed: PdfToolId
  inputFileNames: string[]
  outputFileName: string | null
  fileCount: number
  originalSize: number
  outputSize: number | null
  createdAt: string
}

export type CreateFileActivityValues = {
  toolUsed: PdfToolId
  inputFileNames: string[]
  outputFileName: string | null
  fileCount: number
  originalSize: number
  outputSize: number | null
}

export type GeneratedFile = {
  fileName: string
  blob: Blob
  size: number
  previewUrl?: string
}

export type PdfToolResult = {
  files: GeneratedFile[]
  originalSize: number
  outputSize: number | null
  message?: string
}

export type PdfPageRender = {
  pageNumber: number
  pageCount: number
  width: number
  height: number
}

export type PdfTextFontFamily = "helvetica" | "times_roman" | "courier"

export type PdfTextOverlay = {
  id: string
  pageNumber: number
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: PdfTextFontFamily
  isBold: boolean
  isItalic: boolean
}

export type PdfHighlightAnnotation = {
  id: string
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  color: string
}

export type PdfTextNoteAnnotation = PdfTextOverlay

export type SignaturePlacement = {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
  imageDataUrl: string
}
