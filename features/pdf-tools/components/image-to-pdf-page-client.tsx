"use client"

import { useState } from "react"
import { FileTextIcon } from "lucide-react"
import { toast } from "sonner"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { ImagePreviewGrid } from "@/features/pdf-tools/components/image-preview-grid"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import {
  getTotalFileSize,
  imageExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { imagesToPdf } from "@/features/pdf-tools/lib/pdf-processing"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type { PdfToolResult } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"

const tool = getPdfToolConfig("image_to_pdf")

function moveFile(files: File[], fromIndex: number, toIndex: number) {
  const nextFiles = [...files]
  const [file] = nextFiles.splice(fromIndex, 1)

  nextFiles.splice(toIndex, 0, file)

  return nextFiles
}

export function ImageToPdfPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()

  async function handleProcess() {
    const validationError = validateFileSelection(files, {
      acceptedExtensions: imageExtensions,
      minFiles: 1,
      fileTypeLabel: "JPG, JPEG, or PNG",
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const output = await imagesToPdf(files)

      setResult(output)
      toast.success("PDF created.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "image_to_pdf",
          inputFileNames: files.map((file) => file.name),
          outputFileName: output.files[0]?.fileName ?? null,
          fileCount: files.length,
          originalSize: getTotalFileSize(files),
          outputSize: output.outputSize,
        })
        .catch((activityError) => {
          toast.error(pdfToolMutationError(activityError))
        })
    } catch (processError) {
      setError(pdfToolMutationError(processError))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <ToolPageHeader tool={tool} />
      <FileUploadArea
        files={files}
        multiple
        config={{
          acceptedExtensions: imageExtensions,
          fileTypeLabel: "JPG, JPEG, or PNG",
        }}
        disabled={isProcessing}
        onFilesChange={(nextFiles) => {
          setFiles(nextFiles)
          setResult(null)
          setError("")
        }}
        onValidationError={setError}
      />
      <SelectedFileList
        files={files}
        canReorder
        onRemove={(index) => {
          setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
          setResult(null)
        }}
        onClear={() => {
          setFiles([])
          setResult(null)
          setError("")
        }}
        onMove={(fromIndex, toIndex) => setFiles((current) => moveFile(current, fromIndex, toIndex))}
      />
      <ImagePreviewGrid files={files} />
      <ProcessingState isProcessing={isProcessing} error={error} />
      <Button
        type="button"
        className="self-start"
        disabled={isProcessing || !files.length}
        onClick={handleProcess}
      >
        <FileTextIcon data-icon="inline-start" />
        Create PDF
      </Button>
      <DownloadResultCard result={result} />
    </section>
  )
}
