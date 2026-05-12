import {
  maxPdfToolFileSizeBytes,
  maxPdfToolFiles,
} from "@/features/pdf-tools/schemas"

export const pdfExtensions = ["pdf"] as const
export const imageExtensions = ["jpg", "jpeg", "png"] as const

export type FileValidationConfig = {
  acceptedExtensions: readonly string[]
  maxFiles?: number
  minFiles?: number
  maxSizeBytes?: number
  fileTypeLabel: string
}

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

export function getAcceptAttribute(extensions: readonly string[]) {
  return extensions.map((extension) => `.${extension}`).join(",")
}

export function getTotalFileSize(files: File[]) {
  return files.reduce((total, file) => total + file.size, 0)
}

export function validateFileSelection(
  files: File[],
  {
    acceptedExtensions,
    maxFiles = maxPdfToolFiles,
    minFiles = 1,
    maxSizeBytes = maxPdfToolFileSizeBytes,
    fileTypeLabel,
  }: FileValidationConfig,
) {
  if (files.length < minFiles) {
    return minFiles === 1
      ? `Choose a ${fileTypeLabel} file first.`
      : `Choose at least ${minFiles} ${fileTypeLabel} files.`
  }

  if (files.length > maxFiles) {
    return `Upload up to ${maxFiles} files only.`
  }

  for (const file of files) {
    const extension = getFileExtension(file.name)

    if (!acceptedExtensions.includes(extension)) {
      return `Upload ${fileTypeLabel} files only.`
    }

    if (file.size <= 0) {
      return `${file.name} is empty.`
    }

    if (file.size > maxSizeBytes) {
      return `${file.name} is too large. Keep each file under ${formatFileSize(
        maxSizeBytes,
      )}.`
    }
  }

  return null
}

export function appendValidatedFiles({
  currentFiles,
  incomingFiles,
  config,
}: {
  currentFiles: File[]
  incomingFiles: File[]
  config: FileValidationConfig
}) {
  const nextFiles = [...currentFiles, ...incomingFiles]
  const error = validateFileSelection(nextFiles, {
    ...config,
    minFiles: 1,
  })

  return {
    files: error ? currentFiles : nextFiles,
    error,
  }
}
