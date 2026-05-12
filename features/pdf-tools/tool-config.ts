import {
  ArchiveIcon,
  CombineIcon,
  FileImageIcon,
  FilePenIcon,
  FileSignatureIcon,
  FileTextIcon,
  FileTypeIcon,
  HighlighterIcon,
  ImagesIcon,
  ScissorsIcon,
} from "lucide-react"

import type { PdfToolConfig, PdfToolId } from "@/features/pdf-tools/types"

export const pdfToolConfigs = [
  {
    id: "merge_pdf",
    href: "/pdf-tools/merge",
    label: "Merge PDF",
    description: "Combine multiple PDF files into one organized document.",
    category: "Organize",
    phase: "basic",
    acceptedTypes: "PDF",
    actionLabel: "Merge PDFs",
    icon: CombineIcon,
  },
  {
    id: "split_pdf",
    href: "/pdf-tools/split",
    label: "Split PDF",
    description: "Extract selected pages from a PDF using page ranges.",
    category: "Organize",
    phase: "basic",
    acceptedTypes: "PDF",
    actionLabel: "Split PDF",
    icon: ScissorsIcon,
  },
  {
    id: "image_to_pdf",
    href: "/pdf-tools/image-to-pdf",
    label: "Image to PDF",
    description: "Turn JPG and PNG images into one downloadable PDF.",
    category: "Convert",
    phase: "basic",
    acceptedTypes: "JPG, JPEG, PNG",
    actionLabel: "Create PDF",
    icon: ImagesIcon,
  },
  {
    id: "pdf_to_image",
    href: "/pdf-tools/pdf-to-image",
    label: "PDF to Image",
    description: "Render PDF pages as PNG images for easy reuse.",
    category: "Convert",
    phase: "basic",
    acceptedTypes: "PDF",
    actionLabel: "Convert to PNG",
    icon: FileImageIcon,
  },
  {
    id: "compress_pdf",
    href: "/pdf-tools/compress",
    label: "Compress PDF",
    description: "Rewrite a PDF with basic browser-side optimization.",
    category: "Optimize",
    phase: "basic",
    acceptedTypes: "PDF",
    actionLabel: "Compress PDF",
    icon: ArchiveIcon,
  },
  {
    id: "word_to_pdf",
    href: "https://www.ilovepdf.com/word_to_pdf",
    isExternal: true,
    label: "Word to PDF",
    description: "Open iLovePDF for higher-quality Word to PDF conversion.",
    category: "Convert",
    phase: "basic",
    acceptedTypes: "DOCX",
    actionLabel: "Open iLovePDF",
    icon: FileTextIcon,
  },
  {
    id: "pdf_to_word",
    href: "https://www.ilovepdf.com/pdf_to_word",
    isExternal: true,
    label: "PDF to Word",
    description: "Open iLovePDF for more accurate editable Word conversion.",
    category: "Convert",
    phase: "advanced",
    acceptedTypes: "PDF",
    actionLabel: "Open iLovePDF",
    icon: FileTypeIcon,
  },
  {
    id: "edit_pdf",
    href: "/pdf-tools/edit-pdf",
    label: "Edit PDF",
    description: "Add movable text overlays for filling blanks or simple edits.",
    category: "Edit",
    phase: "advanced",
    acceptedTypes: "PDF",
    actionLabel: "Edit PDF",
    icon: FilePenIcon,
  },
  {
    id: "pdf_annotator",
    href: "/pdf-tools/annotator",
    label: "PDF Annotator",
    description: "Add highlights and text notes to a PDF page.",
    category: "Edit",
    phase: "advanced",
    acceptedTypes: "PDF",
    actionLabel: "Annotate PDF",
    icon: HighlighterIcon,
  },
  {
    id: "sign_pdf",
    href: "/pdf-tools/sign",
    label: "Sign PDF",
    description: "Draw or upload a signature, then place it on a PDF.",
    category: "Edit",
    phase: "advanced",
    acceptedTypes: "PDF, PNG, JPG",
    actionLabel: "Sign PDF",
    icon: FileSignatureIcon,
  },
] satisfies PdfToolConfig[]

export function getPdfToolConfig(id: PdfToolId) {
  const tool = pdfToolConfigs.find((item) => item.id === id)

  if (!tool) {
    throw new Error(`Unknown PDF tool: ${id}`)
  }

  return tool
}
