import { PDFDocument } from "pdf-lib"

import { getFileExtension } from "@/features/pdf-tools/lib/file-validation"
import { parsePageRanges } from "@/features/pdf-tools/lib/page-ranges"
import type { GeneratedFile, PdfToolResult } from "@/features/pdf-tools/types"

async function readFileBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer())
}

function toPdfBlob(bytes: Uint8Array) {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer

  return new Blob([buffer], { type: "application/pdf" })
}

function getBaseFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "")
}

function getOutput(fileName: string, bytes: Uint8Array): GeneratedFile {
  const blob = toPdfBlob(bytes)

  return {
    fileName,
    blob,
    size: blob.size,
  }
}

export async function mergePdfFiles(files: File[]): Promise<PdfToolResult> {
  const mergedPdf = await PDFDocument.create()

  for (const file of files) {
    const sourcePdf = await PDFDocument.load(await readFileBytes(file), {
      ignoreEncryption: true,
      updateMetadata: false,
    })
    const copiedPages = await mergedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices(),
    )

    for (const page of copiedPages) {
      mergedPdf.addPage(page)
    }
  }

  const bytes = await mergedPdf.save({ useObjectStreams: true })
  const output = getOutput("iskokit-merged.pdf", bytes)

  return {
    files: [output],
    originalSize: files.reduce((total, file) => total + file.size, 0),
    outputSize: output.size,
  }
}

export async function splitPdfFile(
  file: File,
  ranges: string | string[],
): Promise<PdfToolResult> {
  const sourcePdf = await PDFDocument.load(await readFileBytes(file), {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const selectedPageIndexes = parsePageRanges(ranges, sourcePdf.getPageCount())
  const outputPdf = await PDFDocument.create()
  const copiedPages = await outputPdf.copyPages(sourcePdf, selectedPageIndexes)

  for (const page of copiedPages) {
    outputPdf.addPage(page)
  }

  const bytes = await outputPdf.save({ useObjectStreams: true })
  const output = getOutput(`${getBaseFileName(file.name)}-split.pdf`, bytes)

  return {
    files: [output],
    originalSize: file.size,
    outputSize: output.size,
  }
}

export async function imagesToPdf(files: File[]): Promise<PdfToolResult> {
  const pdf = await PDFDocument.create()

  for (const file of files) {
    const bytes = await readFileBytes(file)
    const extension = getFileExtension(file.name)
    const image =
      extension === "png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
    const page = pdf.addPage([image.width, image.height])

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    })
  }

  const bytes = await pdf.save({ useObjectStreams: true })
  const output = getOutput("iskokit-images.pdf", bytes)

  return {
    files: [output],
    originalSize: files.reduce((total, file) => total + file.size, 0),
    outputSize: output.size,
  }
}

export async function compressPdfFile(file: File): Promise<PdfToolResult> {
  const sourcePdf = await PDFDocument.load(await readFileBytes(file), {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const bytes = await sourcePdf.save({
    useObjectStreams: true,
    updateFieldAppearances: false,
  })
  const output = getOutput(`${getBaseFileName(file.name)}-compressed.pdf`, bytes)
  const didShrink = output.size < file.size

  return {
    files: [output],
    originalSize: file.size,
    outputSize: output.size,
    message: didShrink
      ? "Basic compression finished."
      : "Basic compression could not reduce this file, but the rewritten PDF is available.",
  }
}
