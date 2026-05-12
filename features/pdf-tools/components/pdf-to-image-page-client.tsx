"use client"

import { useEffect, useState } from "react"
import { DownloadIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { ImagePreviewGrid } from "@/features/pdf-tools/components/image-preview-grid"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import { downloadGeneratedFile, revokeGeneratedFilePreviews } from "@/features/pdf-tools/lib/download"
import {
  getTotalFileSize,
  pdfExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { pdfToPngImages } from "@/features/pdf-tools/lib/pdf-to-image"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type { PdfToolResult } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"

const tool = getPdfToolConfig("pdf_to_image")

export function PdfToImagePageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()

  useEffect(() => {
    return () => {
      if (result) {
        revokeGeneratedFilePreviews(result.files)
      }
    }
  }, [result])

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
      const output = await pdfToPngImages(files[0])

      setResult(output)
      toast.success("PDF converted to PNG images.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "pdf_to_image",
          inputFileNames: files.map((file) => file.name),
          outputFileName: `${output.files.length} PNG images`,
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
          if (result) {
            revokeGeneratedFilePreviews(result.files)
          }

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
        <ImageIcon data-icon="inline-start" />
        Convert to PNG
      </Button>
      {result ? (
        <div className="flex flex-col gap-4">
          <ImagePreviewGrid
            generatedFiles={result.files}
            renderAction={(item) =>
              item.generatedFile ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadGeneratedFile(item.generatedFile!)}
                >
                  <DownloadIcon data-icon="inline-start" />
                  Download
                </Button>
              ) : null
            }
          />
          <DownloadResultCard result={result} />
        </div>
      ) : null}
    </section>
  )
}
