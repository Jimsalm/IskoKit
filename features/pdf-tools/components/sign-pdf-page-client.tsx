"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { pdfToolMutationError } from "@/features/pdf-tools/api"
import { DownloadResultCard } from "@/features/pdf-tools/components/download-result-card"
import { FileUploadArea } from "@/features/pdf-tools/components/file-upload-area"
import { PdfPageNavigator } from "@/features/pdf-tools/components/pdf-page-navigator"
import { PdfPreviewCanvas } from "@/features/pdf-tools/components/pdf-preview-canvas"
import { ProcessingState } from "@/features/pdf-tools/components/processing-state"
import { SelectedFileList } from "@/features/pdf-tools/components/selected-file-list"
import { SignaturePad } from "@/features/pdf-tools/components/signature-pad"
import { ToolPageHeader } from "@/features/pdf-tools/components/tool-page-header"
import { useCreateFileActivity } from "@/features/pdf-tools/hooks"
import {
  getTotalFileSize,
  pdfExtensions,
  validateFileSelection,
} from "@/features/pdf-tools/lib/file-validation"
import { writeSignatureToPdf } from "@/features/pdf-tools/lib/pdf-overlays"
import { getPdfToolConfig } from "@/features/pdf-tools/tool-config"
import type { PdfPageRender, PdfToolResult, SignaturePlacement } from "@/features/pdf-tools/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const tool = getPdfToolConfig("sign_pdf")

type SignaturePointerAction =
  | {
      type: "drag"
      containerHeight: number
      containerLeft: number
      containerTop: number
      containerWidth: number
      offsetX: number
      offsetY: number
    }
  | {
      type: "resize"
      containerHeight: number
      containerLeft: number
      containerTop: number
      containerWidth: number
    }

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getSignaturePreviewRect(target: HTMLElement) {
  const preview = target.closest("[data-signature-preview]")

  if (!(preview instanceof HTMLElement)) {
    return null
  }

  return preview.getBoundingClientRect()
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  )
}

export function SignPdfPageClient() {
  const [files, setFiles] = useState<File[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [signatureDataUrl, setSignatureDataUrl] = useState("")
  const [placement, setPlacement] = useState<SignaturePlacement | null>(null)
  const activePointerActionRef = useRef<SignaturePointerAction | null>(null)
  const [result, setResult] = useState<PdfToolResult | null>(null)
  const [error, setError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const createActivityMutation = useCreateFileActivity()
  const handleRender = useCallback((render: PdfPageRender) => {
    setPageCount(render.pageCount)
  }, [])

  function ensurePlacement() {
    const nextPlacement = placement ?? {
      pageNumber,
      x: 0.28,
      y: 0.36,
      width: 0.28,
      height: 0.12,
      imageDataUrl: signatureDataUrl,
    }

    setPlacement({
      ...nextPlacement,
      pageNumber,
      imageDataUrl: signatureDataUrl,
    })
  }

  function stopSignaturePointerAction() {
    activePointerActionRef.current = null
  }

  function deleteSignaturePlacement() {
    stopSignaturePointerAction()
    setPlacement(null)
    setResult(null)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Backspace" && event.key !== "Delete") {
        return
      }

      if (!placement || isEditableKeyboardTarget(event.target)) {
        return
      }

      event.preventDefault()
      deleteSignaturePlacement()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  })

  function updateSignaturePointerAction(clientX: number, clientY: number) {
    const action = activePointerActionRef.current

    if (!action) {
      return
    }

    const pointerX = clamp(
      (clientX - action.containerLeft) / action.containerWidth,
      0,
      1,
    )
    const pointerY = clamp(
      (clientY - action.containerTop) / action.containerHeight,
      0,
      1,
    )

    setPlacement((current) => {
      if (!current) {
        return current
      }

      if (action.type === "drag") {
        return {
          ...current,
          x: clamp(pointerX - action.offsetX, 0, 1 - current.width),
          y: clamp(pointerY - action.offsetY, 0, 1 - current.height),
        }
      }

      return {
        ...current,
        width: clamp(pointerX - current.x, 0.1, Math.min(0.8, 1 - current.x)),
        height: clamp(
          pointerY - current.y,
          0.05,
          Math.min(0.4, 1 - current.y),
        ),
      }
    })
    setResult(null)
  }

  function startSignaturePointerAction({
    event,
    type,
  }: {
    event: ReactPointerEvent<HTMLElement>
    type: SignaturePointerAction["type"]
  }) {
    if (!placement || event.button !== 0) {
      return
    }

    const rect = getSignaturePreviewRect(event.currentTarget)

    if (!rect) {
      return
    }

    const pointerX = (event.clientX - rect.left) / rect.width
    const pointerY = (event.clientY - rect.top) / rect.height

    event.preventDefault()
    activePointerActionRef.current =
      type === "drag"
        ? {
            type,
            containerHeight: rect.height,
            containerLeft: rect.left,
            containerTop: rect.top,
            containerWidth: rect.width,
            offsetX: pointerX - placement.x,
            offsetY: pointerY - placement.y,
          }
        : {
            type,
            containerHeight: rect.height,
            containerLeft: rect.left,
            containerTop: rect.top,
            containerWidth: rect.width,
          }

    function handlePointerMove(moveEvent: PointerEvent) {
      updateSignaturePointerAction(moveEvent.clientX, moveEvent.clientY)
    }

    function stopPointerAction() {
      stopSignaturePointerAction()
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", stopPointerAction)
      window.removeEventListener("pointercancel", stopPointerAction)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", stopPointerAction)
    window.addEventListener("pointercancel", stopPointerAction)
  }

  async function handleSave() {
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

    if (!signatureDataUrl) {
      setError("Draw or upload a signature first.")
      return
    }

    const finalPlacement = {
      ...(placement ?? {
        pageNumber,
        x: 0.28,
        y: 0.36,
        width: 0.28,
        height: 0.12,
      }),
      pageNumber,
      imageDataUrl: signatureDataUrl,
    }

    setIsProcessing(true)
    setError("")

    try {
      const output = await writeSignatureToPdf({
        file: files[0],
        placement: finalPlacement,
      })

      setResult(output)
      toast.success("Signed PDF ready.")
      void createActivityMutation
        .mutateAsync({
          toolUsed: "sign_pdf",
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
          setPageNumber(1)
          setPlacement(null)
          setResult(null)
          setError("")
        }}
        onValidationError={setError}
      />
      <SelectedFileList
        files={files}
        onRemove={() => {
          setFiles([])
          setPlacement(null)
          setResult(null)
        }}
        onClear={() => {
          setFiles([])
          setPlacement(null)
          setResult(null)
          setError("")
        }}
      />
      <SignaturePad
        signatureDataUrl={signatureDataUrl}
        onSignatureChange={(value) => {
          setSignatureDataUrl(value)
          setPlacement((current) =>
            current ? { ...current, imageDataUrl: value } : current,
          )
          setResult(null)
        }}
      />
      {files[0] ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Place signature</CardTitle>
              <CardDescription>
                Drag the signature on the preview and use the corner handle to
                resize it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                className="self-start"
                disabled={!signatureDataUrl}
                onClick={ensurePlacement}
              >
                Place signature
              </Button>
            </CardContent>
          </Card>
          <PdfPageNavigator
            pageNumber={pageNumber}
            pageCount={pageCount}
            onPageChange={setPageNumber}
          />
          <PdfPreviewCanvas
            file={files[0]}
            pageNumber={pageNumber}
            onRender={handleRender}
          >
            {(render) =>
              placement && placement.pageNumber === render.pageNumber ? (
                <div
                  data-signature-preview
                  className="absolute inset-0"
                  style={{ width: render.width, height: render.height }}
                >
                  <div
                    className="absolute cursor-move border border-primary bg-transparent"
                    style={{
                      left: `${placement.x * 100}%`,
                      top: `${placement.y * 100}%`,
                      width: `${placement.width * 100}%`,
                      height: `${placement.height * 100}%`,
                    }}
                    onPointerDown={(event) => {
                      startSignaturePointerAction({
                        event,
                        type: "drag",
                      })
                    }}
                    role="button"
                    aria-label="Move signature placement"
                    tabIndex={0}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={placement.imageDataUrl}
                      alt="Placed signature"
                      className="h-full w-full object-contain"
                    />
                    <button
                      type="button"
                      className="absolute -bottom-1 -right-1 size-4 cursor-nwse-resize border border-primary bg-background"
                      aria-label="Resize signature"
                      onPointerDown={(event) => {
                        event.stopPropagation()
                        startSignaturePointerAction({
                          event,
                          type: "resize",
                        })
                      }}
                    />
                  </div>
                </div>
              ) : null
            }
          </PdfPreviewCanvas>
        </>
      ) : null}
      <ProcessingState isProcessing={isProcessing} error={error} />
      <Button
        type="button"
        className="self-start"
        disabled={isProcessing || !files.length || !signatureDataUrl}
        onClick={handleSave}
      >
        <SaveIcon data-icon="inline-start" />
        Save signed PDF
      </Button>
      <DownloadResultCard result={result} />
    </section>
  )
}
