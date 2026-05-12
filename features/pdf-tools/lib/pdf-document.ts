import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/types/src/display/api"
import { PDFDocument as PdfLibDocument } from "pdf-lib"

async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString()

  return pdfjs
}

export function getPdfReadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (/password|encrypted/i.test(message)) {
    return "This PDF requires a password. Enter the correct password or use an unlocked file."
  }

  if (/invalid|corrupt|damaged|format/i.test(message)) {
    return "This PDF could not be read. It may be corrupted or unsupported."
  }

  if (/worker|fake worker/i.test(message)) {
    return "The PDF renderer could not start. Refresh the page and try again."
  }

  if (/no readable text/i.test(message)) {
    return "No readable text was found in this PDF."
  }

  return "Could not read this PDF. Please try another file."
}

async function getPdfBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer())
}

async function rewritePdfBytes(file: File) {
  const document = await PdfLibDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: true,
  })

  return document.save({
    useObjectStreams: false,
  })
}

async function loadPdfDocumentFromBytes(data: Uint8Array, password?: string) {
  const pdfjs = await getPdfjs()
  const loadingTask = pdfjs.getDocument({
    data,
    password,
    disableFontFace: false,
    stopAtErrors: false,
    useWorkerFetch: false,
  })

  return loadingTask.promise as Promise<PDFDocumentProxy>
}

export async function loadPdfDocument(file: File, password?: string) {
  return loadPdfDocumentFromBytes(await getPdfBytes(file), password)
}

export async function assertReadablePdf(file: File, password?: string) {
  const document = await loadPdfDocument(file, password)

  try {
    return document.numPages
  } finally {
    await document.destroy()
  }
}

export async function getPdfPageSize({
  file,
  pageNumber,
  scale = 1.25,
}: {
  file: File
  pageNumber: number
  scale?: number
}) {
  const document = await loadPdfDocument(file)

  try {
    const page = await document.getPage(pageNumber)
    const viewport = page.getViewport({ scale })

    return {
      pageCount: document.numPages,
      width: viewport.width,
      height: viewport.height,
    }
  } finally {
    await document.destroy()
  }
}

export async function renderPdfPageToCanvas({
  file,
  pageNumber,
  canvas,
  scale = 1.25,
}: {
  file: File
  pageNumber: number
  canvas: HTMLCanvasElement
  scale?: number
}) {
  async function renderFromBytes(data: Uint8Array) {
    const document = await loadPdfDocumentFromBytes(data)

    try {
      const page = (await document.getPage(pageNumber)) as PDFPageProxy
      const viewport = page.getViewport({ scale })
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Canvas is not available in this browser.")
      }

      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise

      return {
        pageNumber,
        pageCount: document.numPages,
        width: viewport.width,
        height: viewport.height,
      }
    } finally {
      await document.destroy()
    }
  }

  try {
    return await renderFromBytes(await getPdfBytes(file))
  } catch (renderError) {
    try {
      return await renderFromBytes(await rewritePdfBytes(file))
    } catch {
      throw renderError
    }
  }
}

export async function extractPdfTextPages(file: File, password?: string) {
  const document = await loadPdfDocument(file, password)

  try {
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => {
          if (!item || typeof item !== "object" || !("str" in item)) {
            return ""
          }

          return String(item.str)
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()

      pages.push(pageText)
    }

    return pages
  } finally {
    await document.destroy()
  }
}
