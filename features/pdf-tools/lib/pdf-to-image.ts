import type { GeneratedFile, PdfToolResult } from "@/features/pdf-tools/types"

function getBaseFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "")
}

async function canvasToPngBlob(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png")
  })

  if (!blob) {
    throw new Error("Could not create a PNG image from this PDF page.")
  }

  return blob
}

export async function pdfToPngImages(file: File): Promise<PdfToolResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString()

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    disableFontFace: false,
    useWorkerFetch: false,
  })
  const document = await loadingTask.promise

  try {
    const outputs: GeneratedFile[] = []
    const baseName = getBaseFileName(file.name)

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = window.document.createElement("canvas")
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

      const blob = await canvasToPngBlob(canvas)
      const previewUrl = URL.createObjectURL(blob)

      outputs.push({
        fileName: `${baseName}-page-${pageNumber}.png`,
        blob,
        size: blob.size,
        previewUrl,
      })
    }

    return {
      files: outputs,
      originalSize: file.size,
      outputSize: outputs.reduce((total, output) => total + output.size, 0),
    }
  } finally {
    await document.destroy()
  }
}
