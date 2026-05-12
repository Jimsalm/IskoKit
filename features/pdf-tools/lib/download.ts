import type { GeneratedFile } from "@/features/pdf-tools/types"

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = fileName
  anchor.click()

  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

export function downloadGeneratedFile(file: GeneratedFile) {
  downloadBlob(file.blob, file.fileName)
}

export function revokeGeneratedFilePreviews(files: GeneratedFile[]) {
  for (const file of files) {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
  }
}
