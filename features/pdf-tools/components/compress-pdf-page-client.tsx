"use client"

import { useState } from "react"
import { ArchiveIcon } from "lucide-react"
import { toast } from "sonner"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import {
  getTotalFileSize,
  pdfExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { compressPdfFile } from "@/features/pdf-tools/lib/pdf-processing"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type { PdfToolResult } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"

const tool = getPdfToolConfig("compress_pdf")

export function CompressPdfPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()

  async function handleProcess() {
    const validationError = validateFileSelection(files, {
      acceptedExtensions: pdfExtensions,
      minFiles: 1,
      maxFiles: 1,
      fileTypeLabel: "PDF",
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const output = await compressPdfFile(files[0])

      setResult(output)
      toast.success("Compression finished.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "compress_pdf",
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
        config={{
          acceptedExtensions: pdfExtensions,
          maxFiles: 1,
          fileTypeLabel: "PDF",
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
        onRemove={() => {
          setFiles([])
          setResult(null)
        }}
        onClear={() => {
          setFiles([])
          setResult(null)
          setError("")
        }}
      />
      <ProcessingState isProcessing={isProcessing} error={error} />
      <Button
        type="button"
        className="self-start"
        disabled={isProcessing || !files.length}
        onClick={handleProcess}
      >
        <ArchiveIcon data-icon="inline-start" />
        Compress PDF
      </Button>
      <DownloadResultCard result={result} />
    </section>
  )
}
