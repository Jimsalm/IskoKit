"use client"

import { useRef, useState } from "react"
import { PlusIcon, ScissorsIcon, Trash2Icon } from "lucide-react"
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
import {
  assertReadablePdf,
  getPdfReadErrorMessage,
} from "@/features/pdf-tools/lib/pdf-document"
import { splitPdfFile } from "@/features/pdf-tools/lib/pdf-processing"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type { PdfToolResult } from "@/features/pdf-tools/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const tool = getPdfToolConfig("split_pdf")
type PageRangeField = {
  id: string
  value: string
}

function createPageRangeField(index: number): PageRangeField {
  return {
    id: `page-range-${Date.now()}-${index}`,
    value: "",
  }
}

export function SplitPdfPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [ranges, setRanges] = useState<PageRangeField[]>([
    {
      id: "page-range-1",
      value: "",
    },
  ])
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isReadingPageCount, setIsReadingPageCount] = useState(false)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const pageCountRequestRef = useRef(0)
  const createActivityMutation = useCreateFileActivity()
  const hasPageRange = ranges.some((range) => range.value.trim())

  function resetPageCount() {
    pageCountRequestRef.current += 1
    setPageCount(null)
    setIsReadingPageCount(false)
  }

  function readPageCount(file: File) {
    pageCountRequestRef.current += 1
    const requestId = pageCountRequestRef.current

    setPageCount(null)
    setIsReadingPageCount(true)
    void assertReadablePdf(file)
      .then((count) => {
        if (pageCountRequestRef.current !== requestId) {
          return
        }

        setPageCount(count)
        setError("")
      })
      .catch((pageCountError) => {
        if (pageCountRequestRef.current !== requestId) {
          return
        }

        setError(getPdfReadErrorMessage(pageCountError))
      })
      .finally(() => {
        if (pageCountRequestRef.current !== requestId) {
          return
        }

        setIsReadingPageCount(false)
      })
  }

  function updateRange(id: string, value: string) {
    setRanges((currentRanges) =>
      currentRanges.map((range) =>
        range.id === id
          ? {
              ...range,
              value,
            }
          : range,
      ),
    )
    setResult(null)
    setError("")
  }

  function addRange() {
    setRanges((currentRanges) => [
      ...currentRanges,
      createPageRangeField(currentRanges.length + 1),
    ])
    setResult(null)
    setError("")
  }

  function removeRange(id: string) {
    setRanges((currentRanges) => {
      if (currentRanges.length === 1) {
        return [
          {
            ...currentRanges[0],
            value: "",
          },
        ]
      }

      return currentRanges.filter((range) => range.id !== id)
    })
    setResult(null)
    setError("")
  }

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
      const output = await splitPdfFile(
        files[0],
        ranges.map((range) => range.value),
      )

      setResult(output)
      toast.success("PDF split.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "split_pdf",
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
          resetPageCount()

          if (nextFiles[0]) {
            readPageCount(nextFiles[0])
          }
        }}
        onValidationError={setError}
      />
      <SelectedFileList
        files={files}
        onRemove={() => {
          setFiles([])
          setResult(null)
          resetPageCount()
        }}
        onClear={() => {
          setFiles([])
          setResult(null)
          setError("")
          resetPageCount()
        }}
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Page ranges</CardTitle>
            {isReadingPageCount ? (
              <Badge variant="secondary">Detecting pages</Badge>
            ) : pageCount ? (
              <Badge variant="secondary">{pageCount} pages</Badge>
            ) : null}
          </div>
          <CardDescription>
            Choose the pages to extract from the uploaded PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field className="gap-3">
            <FieldLabel>Pages</FieldLabel>
            <div className="flex flex-col gap-3">
              {ranges.map((range, index) => (
                <div
                  key={range.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2"
                >
                  <Input
                    value={range.value}
                    placeholder={index === 0 ? "1-last" : "5 or 9-10"}
                    aria-label={`Page range ${index + 1}`}
                    onChange={(event) => {
                      updateRange(range.id, event.target.value)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Remove page range ${index + 1}`}
                    onClick={() => {
                      removeRange(range.id)
                    }}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={addRange}
            >
              <PlusIcon data-icon="inline-start" />
              Add page range
            </Button>
            <FieldDescription>
              {isReadingPageCount
                ? "Detecting the last page..."
                : pageCount
                  ? "Add one range per row. Examples: 1-3, 5, 9-10, or 1-last."
                  : "Upload a PDF first. Then add one page or range per row."}
            </FieldDescription>
          </Field>
        </CardContent>
      </Card>
      <ProcessingState isProcessing={isProcessing} error={error} />
      <Button
        type="button"
        className="self-start"
        disabled={isProcessing || isReadingPageCount || !files.length || !hasPageRange}
        onClick={handleProcess}
      >
        <ScissorsIcon data-icon="inline-start" />
        Split PDF
      </Button>
      <DownloadResultCard result={result} />
    </section>
  )
}
