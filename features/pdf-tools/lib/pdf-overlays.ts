import { BlendMode, PDFDocument, rgb, StandardFonts } from "pdf-lib"

import type {
  GeneratedFile,
  PdfHighlightAnnotation,
  PdfTextNoteAnnotation,
  PdfTextOverlay,
  PdfTextFontFamily,
  PdfToolResult,
  SignaturePlacement,
} from "@/features/pdf-tools/types"

async function readFileBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer())
}

function getBaseFileName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "")
}

function toPdfBlob(bytes: Uint8Array) {
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer

  return new Blob([buffer], { type: "application/pdf" })
}

function getOutput(fileName: string, bytes: Uint8Array): GeneratedFile {
  const blob = toPdfBlob(bytes)

  return {
    fileName,
    blob,
    size: blob.size,
  }
}

function hexToRgb(value: string) {
  const hex = value.replace("#", "")
  const red = Number.parseInt(hex.slice(0, 2), 16) / 255
  const green = Number.parseInt(hex.slice(2, 4), 16) / 255
  const blue = Number.parseInt(hex.slice(4, 6), 16) / 255

  return rgb(red || 0, green || 0, blue || 0)
}

function dataUrlToBytes(value: string) {
  const [, base64 = ""] = value.split(",")
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function getStandardFontName({
  fontFamily,
  isBold,
  isItalic,
}: {
  fontFamily?: PdfTextFontFamily
  isBold?: boolean
  isItalic?: boolean
}) {
  if (fontFamily === "times_roman") {
    if (isBold && isItalic) {
      return StandardFonts.TimesRomanBoldItalic
    }

    if (isBold) {
      return StandardFonts.TimesRomanBold
    }

    if (isItalic) {
      return StandardFonts.TimesRomanItalic
    }

    return StandardFonts.TimesRoman
  }

  if (fontFamily === "courier") {
    if (isBold && isItalic) {
      return StandardFonts.CourierBoldOblique
    }

    if (isBold) {
      return StandardFonts.CourierBold
    }

    if (isItalic) {
      return StandardFonts.CourierOblique
    }

    return StandardFonts.Courier
  }

  if (isBold && isItalic) {
    return StandardFonts.HelveticaBoldOblique
  }

  if (isBold) {
    return StandardFonts.HelveticaBold
  }

  if (isItalic) {
    return StandardFonts.HelveticaOblique
  }

  return StandardFonts.Helvetica
}

async function embedTextFont(
  pdf: PDFDocument,
  text: Pick<PdfTextOverlay, "fontFamily" | "isBold" | "isItalic">,
) {
  return pdf.embedFont(getStandardFontName(text))
}

export async function writeTextOverlaysToPdf({
  file,
  overlays,
}: {
  file: File
  overlays: PdfTextOverlay[]
}): Promise<PdfToolResult> {
  const pdf = await PDFDocument.load(await readFileBytes(file), {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const pages = pdf.getPages()

  for (const overlay of overlays) {
    const page = pages[overlay.pageNumber - 1]

    if (!page || !overlay.text.trim()) {
      continue
    }

    const { width, height } = page.getSize()
    const x = overlay.x * width
    const y = height - overlay.y * height - overlay.fontSize
    const font = await embedTextFont(pdf, overlay)

    page.drawText(overlay.text.trim(), {
      x,
      y,
      size: overlay.fontSize,
      font,
      color: hexToRgb(overlay.color),
    })
  }

  const bytes = await pdf.save({ useObjectStreams: true })
  const output = getOutput(`${getBaseFileName(file.name)}-edited.pdf`, bytes)

  return {
    files: [output],
    originalSize: file.size,
    outputSize: output.size,
  }
}

export async function writeAnnotationsToPdf({
  file,
  highlights,
  notes,
}: {
  file: File
  highlights: PdfHighlightAnnotation[]
  notes: PdfTextNoteAnnotation[]
}): Promise<PdfToolResult> {
  const pdf = await PDFDocument.load(await readFileBytes(file), {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const pages = pdf.getPages()

  for (const highlight of highlights) {
    const page = pages[highlight.pageNumber - 1]

    if (!page) {
      continue
    }

    const { width, height } = page.getSize()
    page.drawRectangle({
      x: highlight.x * width,
      y: height - highlight.y * height - highlight.height * height,
      width: highlight.width * width,
      height: highlight.height * height,
      color: hexToRgb(highlight.color),
      opacity: 0.3,
      borderOpacity: 0,
      blendMode: BlendMode.Multiply,
    })
  }

  for (const note of notes) {
    const page = pages[note.pageNumber - 1]

    if (!page || !note.text.trim()) {
      continue
    }

    const { width, height } = page.getSize()
    const text = note.text.trim()
    const paddingX = 6
    const x = note.x * width
    const y = height - note.y * height - note.fontSize
    const font = await embedTextFont(pdf, note)

    page.drawText(text, {
      x: x + paddingX,
      y,
      size: note.fontSize,
      font,
      color: hexToRgb(note.color),
    })
  }

  const bytes = await pdf.save({ useObjectStreams: true })
  const output = getOutput(`${getBaseFileName(file.name)}-annotated.pdf`, bytes)

  return {
    files: [output],
    originalSize: file.size,
    outputSize: output.size,
  }
}

export async function writeSignatureToPdf({
  file,
  placement,
}: {
  file: File
  placement: SignaturePlacement
}): Promise<PdfToolResult> {
  const pdf = await PDFDocument.load(await readFileBytes(file), {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  const page = pdf.getPages()[placement.pageNumber - 1]

  if (!page) {
    throw new Error("Choose a valid page for the signature.")
  }

  const imageBytes = dataUrlToBytes(placement.imageDataUrl)
  const image = placement.imageDataUrl.startsWith("data:image/png")
    ? await pdf.embedPng(imageBytes)
    : await pdf.embedJpg(imageBytes)
  const { width, height } = page.getSize()

  page.drawImage(image, {
    x: placement.x * width,
    y: height - placement.y * height - placement.height * height,
    width: placement.width * width,
    height: placement.height * height,
  })

  const bytes = await pdf.save({ useObjectStreams: true })
  const output = getOutput(`${getBaseFileName(file.name)}-signed.pdf`, bytes)

  return {
    files: [output],
    originalSize: file.size,
    outputSize: output.size,
  }
}
