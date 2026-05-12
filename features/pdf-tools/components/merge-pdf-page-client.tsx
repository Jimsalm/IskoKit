"use client"

import { useState } from "react"
import { CombineIcon } from "lucide-react"
import { toast } from "sonner"

import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import {
  getTotalFileSize,
  pdfExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { mergePdfFiles } from "@/features/pdf-tools/lib/pdf-processing"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type { PdfToolResult } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"

const tool = getPdfToolConfig("merge_pdf")

function moveFile(files: File[], fromIndex: number, toIndex: number) {
  const nextFiles = [...files]
  const [file] = nextFiles.splice(fromIndex, 1)

  nextFiles.splice(toIndex, 0, file)

  return nextFiles
}

export function MergePdfPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()

  async function handleProcess() {
    const validationError = validateFileSelection(files, {
      acceptedExtensions: pdfExtensions,
      minFiles: 2,
      fileTypeLabel: "PDF",
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const output = await mergePdfFiles(files)

      setResult(output)
      toast.success("PDFs merged.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "merge_pdf",
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
          acceptedExtensions: pdfExtensions,
          minFiles: 1,
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
      <ProcessingState isProcessing={isProcessing} error={error} />
      <Button
        type="button"
        className="self-start"
        disabled={isProcessing || files.length < 2}
        onClick={handleProcess}
      >
        <CombineIcon data-icon="inline-start" />
        Merge PDFs
      </Button>
      <DownloadResultCard result={result} />
    </section>
  )
}
