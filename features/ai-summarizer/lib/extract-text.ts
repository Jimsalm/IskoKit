import { join } from "node:path"
import { pathToFileURL } from "node:url"

import mammoth from "mammoth"

import { getFileExtension } from "@/features/ai-summarizer/lib/file-validation"

export function cleanExtractedText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function extractPdfText(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(
      process.cwd(),
      "node_modules",
      "pdfjs-dist",
      "legacy",
      "build",
      "pdf.worker.mjs",
    ),
  ).href
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    standardFontDataUrl: "./node_modules/pdfjs-dist/standard_fonts/",
    cMapUrl: "./node_modules/pdfjs-dist/cmaps/",
    cMapPacked: true,
    useWorkerFetch: false,
  })
  const document = await loadingTask.promise

  try {
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")

      pages.push(pageText)
    }

    return cleanExtractedText(pages.join("\n\n"))
  } finally {
    await document.destroy()
  }
}

export async function extractReadableText(file: File) {
  const extension = getFileExtension(file.name)
  const buffer = Buffer.from(await file.arrayBuffer())

  if (extension === "txt") {
    return cleanExtractedText(buffer.toString("utf8"))
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer })

    return cleanExtractedText(result.value)
  }

  if (extension === "pdf") {
    return extractPdfText(buffer)
  }

  return ""
}
