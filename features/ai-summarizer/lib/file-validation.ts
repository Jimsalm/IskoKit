import {
  maxSummaryFileSizeBytes,
  supportedSummaryFileExtensions,
} from "@/features/ai-summarizer/schemas"

const extensionSet = new Set<string>(supportedSummaryFileExtensions)

export function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kilobytes = bytes / 1024

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`
}

export function validateSummaryFile(file: File) {
  const extension = getFileExtension(file.name)

  if (!extensionSet.has(extension)) {
    return "Upload a TXT, DOCX, or PDF file."
  }

  if (file.size <= 0) {
    return "The selected file is empty."
  }

  if (file.size > maxSummaryFileSizeBytes) {
    return `Keep files under ${formatFileSize(maxSummaryFileSizeBytes)}.`
  }

  return null
}
